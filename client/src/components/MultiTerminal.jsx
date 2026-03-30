import { useState, useRef, useCallback, useEffect } from 'react';
import { Plus, X, Pin, Monitor, GripHorizontal } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useTerminal } from '../hooks/useTerminal';
import { useLanguage } from '../context/LanguageContext';
import { useJobs } from '../context/JobContext';

function SingleCardTerm({ id, title, onClose, pinned, onTogglePin }) {
  const containerRef = useRef(null);
  const [innerHeight, setInnerHeight] = useState(240);
  const [isResizing, setIsResizing] = useState(false);
  const { isReady } = useTerminal(id, containerRef);
  const { t } = useLanguage();

  const startResizing = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e) => {
    if (isResizing) {
      const newHeight = e.clientY - containerRef.current.getBoundingClientRect().top;
      if (newHeight > 100 && newHeight < 1200) {
        setInnerHeight(newHeight);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  return (
    <div className={`terminal-window ${isResizing ? 'resizing' : ''}`} style={{ marginBottom: 12 }}>
      <div className="terminal-titlebar">
        <div className="terminal-dots">
          <div className="terminal-dot red" /><div className="terminal-dot yellow" /><div className="terminal-dot green" />
        </div>
        <div className="terminal-title">
          <Monitor size={14} style={{ marginRight: 6 }} />
          {isReady
            ? <span style={{ color: 'var(--accent-green)' }}>● {title}</span>
            : <span style={{ color: 'var(--text-muted)' }}>○ {t('connecting')}</span>}
        </div>
        <div style={{ display: 'flex', gap: 4, marginLeft: 'auto', marginRight: 8 }}>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: pinned ? 'var(--accent-green)' : 'var(--text-muted)', padding: 4 }}
            onClick={onTogglePin} title={pinned ? t('unpin') : t('pin')}>
            {pinned ? <Pin size={14} fill="currentColor" /> : <Pin size={14} />}
          </button>
          {!pinned && (
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
              onClick={onClose} title={t('close')}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>
      <div ref={containerRef} style={{ height: innerHeight, padding: '4px 2px' }} />
      <div className="terminal-resize-handle" onMouseDown={startResizing} style={{ 
        height: 10, background: 'rgba(255,255,255,0.02)', cursor: 'ns-resize', 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderTop: '1px solid var(--border)'
      }}>
        <GripHorizontal size={12} color="var(--text-muted)" />
      </div>
    </div>
  );
}

/**
 * MultiTerminal - Reusable multi-terminal component for card pages.
 * @param {string} prefix - Unique prefix for this page (e.g. 'nmap', 'ftp')
 * @param {string} defaultTitle - Default title for new terminals (e.g. 'Nmap Terminal')
 */
export default function MultiTerminal({ prefix, defaultTitle = 'Terminal' }) {
  const { t } = useLanguage();
  const { activeJobId } = useJobs();
  const { socket } = useSocket();

  const storageKey = `htb_cardterms_${prefix}_${activeJobId || 'default'}`;

  const [terms, setTerms] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fall through */ }
    }
    return [{ id: `${prefix}-${activeJobId || 'default'}-1`, title: defaultTitle, pinned: true }];
  });

  // Reload terms when job changes
  useEffect(() => {
    const key = `htb_cardterms_${prefix}_${activeJobId || 'default'}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try { setTerms(JSON.parse(saved)); return; } catch (e) { /* fall through */ }
    }
    setTerms([{ id: `${prefix}-${activeJobId || 'default'}-1`, title: defaultTitle, pinned: true }]);
  }, [activeJobId, prefix, defaultTitle]);

  // Save terms when they change
  useEffect(() => {
    if (terms.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(terms));
    }
  }, [terms, storageKey]);

  const addTerm = () => {
    const nextIndex = terms.length + 1;
    const id = `${prefix}-${activeJobId || 'default'}-${Date.now()}`;
    setTerms(p => [...p, { id, title: `${defaultTitle}-${nextIndex}`, pinned: false }]);
  };

  const closeTerm = (id) => {
    if (socket) socket.emit('terminal:close', { id });
    setTerms(p => p.filter(t => t.id !== id));
  };

  const togglePin = (id) => setTerms(p => p.map(t => t.id === id ? { ...t, pinned: !t.pinned } : t));

  // Return the first terminal ID for commands that need a target
  const firstTermId = terms.length > 0 ? terms[0].id : `${prefix}-${activeJobId || 'default'}-1`;

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center' }}>
        <button className="btn-pro btn-cyan" onClick={addTerm} style={{ padding: '6px 14px', fontSize: 13 }}>
          <Plus size={14} /> {t('new_terminal')}
        </button>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {terms.length} terminal
        </span>
      </div>
      {terms.map(t => (
        <SingleCardTerm
          key={t.id}
          id={t.id}
          title={t.title}
          pinned={t.pinned}
          onClose={() => closeTerm(t.id)}
          onTogglePin={() => togglePin(t.id)}
        />
      ))}
    </div>
  );
}

// Export helper to get first terminal ID for a prefix
export function useMultiTerminalId(prefix) {
  const { activeJobId } = useJobs();
  return `${prefix}-${activeJobId || 'default'}-1`;
}

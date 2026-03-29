import { useState, useRef, useCallback, useEffect } from 'react';
import { Plus, X, Pin, PinOff } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useTerminal } from '../hooks/useTerminal';
import { useLanguage } from '../context/LanguageContext';
import { useJobs } from '../context/JobContext';

import { Monitor, GripHorizontal } from 'lucide-react';

function SingleTerm({ id, title, onClose, pinned, onTogglePin }) {
  const containerRef = useRef(null);
  const [innerHeight, setInnerHeight] = useState(260);
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
    <div className={`terminal-window ${isResizing ? 'resizing' : ''}`} style={{ marginBottom: 20 }}>
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

      <style>{`
        .terminal-window.resizing {
          border-color: var(--accent-cyan);
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.1);
        }
      `}</style>
    </div>
  );
}

export default function MultiTerminalPage() {
  const { t } = useLanguage();
  const { activeJobId } = useJobs();
  const { socket } = useSocket();

  const getStorageKey = useCallback(() => `htb_terms_${activeJobId || 'default'}`, [activeJobId]);

  const [terms, setTerms] = useState([]);
  const [venv, setVenv] = useState(false);

  // Load terms for active job
  useEffect(() => {
    if (!activeJobId) {
      setTerms([{ id: `term-default-1`, title: 'bash', pinned: true }]);
      return;
    }
    const saved = localStorage.getItem(getStorageKey());
    if (saved) {
      try { setTerms(JSON.parse(saved)); } catch (e) { setTerms([{ id: `term-${activeJobId}-1`, title: 'bash', pinned: true }]); }
    } else {
      setTerms([{ id: `term-${activeJobId}-1`, title: 'bash', pinned: true }]);
    }
  }, [activeJobId, getStorageKey]);

  // Save terms when they change
  useEffect(() => {
    if (terms.length > 0 && activeJobId) {
      localStorage.setItem(getStorageKey(), JSON.stringify(terms));
    }
  }, [terms, activeJobId, getStorageKey]);

  const addTerm = () => {
    const nextIndex = terms.length + 1;
    const id = `term-${activeJobId || 'default'}-${Date.now()}`;
    setTerms(p => [...p, { id, title: `bash-${nextIndex}`, pinned: false }]);
  };

  const closeTerm = (id) => {
    if (socket) socket.emit('terminal:close', { id });
    setTerms(p => p.filter(t => t.id !== id));
  };

  const togglePin = (id) => setTerms(p => p.map(t => t.id === id ? { ...t, pinned: !t.pinned } : t));

  return (
    <div style={{ paddingBottom: 40 }}>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 4 }} className="page-header-back">
            <span>⬡ {t('terminal')}</span>
          </div>
          <h1 className="page-title">{t('terminal_mgr')}</h1>
          <p className="page-subtitle">{t('terminal_desc')}</p>
        </div>
      </div>

      <div className="terminal-mgr-controls" style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'center' }}>
        <button className="btn-pro btn-cyan" onClick={addTerm}>
          <Plus size={16} /> {t('new_terminal')}
        </button>
        <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, cursor: 'pointer', color: 'var(--text-secondary)' }}>
          <input type="checkbox" checked={venv} onChange={e => setVenv(e.target.checked)} style={{ width: 18, height: 18 }} />
          <span>{t('run_in_venv')}</span>
        </label>
      </div>

      {terms.map(t => (
        <SingleTerm
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

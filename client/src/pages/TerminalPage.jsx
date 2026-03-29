import { useState, useRef, useCallback, useEffect } from 'react';
import { Plus, X, Pin, PinOff } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useTerminal } from '../hooks/useTerminal';
import { useLanguage } from '../context/LanguageContext';
import { useJobs } from '../context/JobContext';

function SingleTerm({ id, title, onClose, pinned, onTogglePin }) {
  const containerRef = useRef(null);
  const { isReady } = useTerminal(id, containerRef);
  const { t } = useLanguage();

  return (
    <div className="terminal-window" style={{ minHeight: 280 }}>
      <div className="terminal-titlebar">
        <div className="terminal-dots">
          <div className="terminal-dot red" />
          <div className="terminal-dot yellow" />
          <div className="terminal-dot green" />
        </div>
        <div className="terminal-title">
          {isReady
            ? <span style={{ color: 'var(--accent-green)' }}>● {title}</span>
            : <span style={{ color: 'var(--text-muted)' }}>○ {t('connecting')}</span>}
        </div>
        <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: pinned ? 'var(--accent-green)' : 'var(--text-muted)', padding: 2 }}
            onClick={onTogglePin} title={pinned ? t('unpin') : t('pin')}>
            {pinned ? <Pin size={11} /> : <PinOff size={11} />}
          </button>
          {!pinned && (
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}
              onClick={onClose} title={t('close')}>
              <X size={11} />
            </button>
          )}
        </div>
      </div>
      <div ref={containerRef} style={{ height: 260, padding: '4px 2px' }} />
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

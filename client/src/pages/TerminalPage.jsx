import { useState, useRef, useCallback } from 'react';
import { Plus, X, Pin, PinOff } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useTerminal } from '../hooks/useTerminal';
import { useLanguage } from '../context/LanguageContext';

let termCounter = 0;

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
  const [terms, setTerms] = useState(() => {
    termCounter++;
    return [{ id: `term-${termCounter}`, title: 'bash', pinned: true }];
  });
  const [venv, setVenv] = useState(false);

  const addTerm = () => {
    termCounter++;
    const id = `term-${termCounter}`;
    setTerms(p => [...p, { id, title: `bash-${termCounter}`, pinned: false }]);
  };

  const closeTerm = (id) => setTerms(p => p.filter(t => t.id !== id));
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

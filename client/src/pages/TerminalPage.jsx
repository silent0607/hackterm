import { useState, useRef, useCallback } from 'react';
import { Plus, X, Pin, PinOff } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useTerminal } from '../hooks/useTerminal';

let termCounter = 0;

function SingleTerm({ id, title, onClose, pinned, onTogglePin }) {
  const containerRef = useRef(null);
  const { isReady } = useTerminal(id, containerRef);

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
            : <span style={{ color: 'var(--text-muted)' }}>○ bağlanıyor...</span>}
        </div>
        <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: pinned ? 'var(--accent-green)' : 'var(--text-muted)', padding: 2 }}
            onClick={onTogglePin} title={pinned ? 'Sabiti Kaldır' : 'Sabitle'}>
            {pinned ? <Pin size={11} /> : <PinOff size={11} />}
          </button>
          {!pinned && (
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}
              onClick={onClose} title="Kapat">
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
    <div>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 4 }} className="page-header-back">
            <span>⬡ Terminal</span>
          </div>
          <div className="page-title">Terminal <span>Yöneticisi</span></div>
          <div className="page-subtitle">Yerel bash terminallerini burada yönet. Pin = daima açık.</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <button className="btn btn-green" onClick={addTerm}>
          <Plus size={13} /> Yeni Terminal
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <input type="checkbox" checked={venv} onChange={e => setVenv(e.target.checked)}
            style={{ accentColor: 'var(--accent-purple)' }} />
          Sanal ortamda (venv) çalıştır
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

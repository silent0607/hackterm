import { useRef, useEffect } from 'react';
import { useTerminal } from '../../hooks/useTerminal';

export default function TerminalWidget({ id, title = 'terminal', height = 300, style }) {
  const containerRef = useRef(null);
  const { isReady, writeCommand } = useTerminal(id, containerRef);

  return (
    <div className="terminal-container" style={{ height, ...style }}>
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
      </div>
      <div className="terminal-body" ref={containerRef} style={{ height: height - 38 }} />
    </div>
  );
}

// Expose writeCommand through ref
export { TerminalWidget };

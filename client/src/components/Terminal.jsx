import { useRef, useState, useEffect, useCallback } from 'react';
import { useTerminal } from '../hooks/useTerminal';
import { Maximize2, Minimize2, Terminal as TerminalIcon, GripHorizontal } from 'lucide-react';

export default function Terminal({ id, height: initialHeight = 280, title = 'terminal' }) {
  const containerRef = useRef(null);
  const [innerHeight, setInnerHeight] = useState(initialHeight - 38);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const { isReady } = useTerminal(id, containerRef);

  const toggleExpand = () => {
    if (!isExpanded) {
      setInnerHeight(562);
    } else {
      setInnerHeight(initialHeight - 38);
    }
    setIsExpanded(!isExpanded);
  };

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
    }
  }, [isResizing, resize, stopResizing]);

  return (
    <div className={`terminal-container-pro ${isResizing ? 'resizing' : ''}`} style={{ height: innerHeight + 38 }}>
      <div className="terminal-titlebar">
        <div className="terminal-dots">
          <div className="terminal-dot red" /><div className="terminal-dot yellow" /><div className="terminal-dot green" />
        </div>
        <div className="terminal-title">
          <TerminalIcon size={14} style={{ marginRight: 6 }} />
          {isReady ? <span style={{ color: 'var(--accent-green)' }}>● {title}</span> : <span style={{ color: 'var(--text-muted)' }}>○ bağlanıyor...</span>}
        </div>
        <button className="terminal-action-btn" onClick={toggleExpand} title={isExpanded ? 'Küçült' : 'Varsayılan Boyut'}>
          {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>
      <div ref={containerRef} className="terminal-inner" style={{ height: innerHeight }} />
      
      <div className="terminal-resize-handle" onMouseDown={startResizing}>
        <GripHorizontal size={16} color="var(--text-muted)" />
      </div>

      <style>{`
        .terminal-container-pro {
          display: flex;
          flex-direction: column;
          background: #050508;
          border-radius: 12px;
          border: 1px solid var(--border);
          overflow: hidden;
          position: relative;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          margin-bottom: 20px;
        }
        .terminal-container-pro.resizing {
          border-color: var(--accent-blue);
          user-select: none;
        }
        .terminal-inner {
          padding: 4px 2px;
          background: transparent;
        }
        .terminal-resize-handle {
          height: 12px;
          background: var(--bg-card);
          border-top: 1px solid var(--border);
          cursor: ns-resize;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .terminal-resize-handle:hover {
          background: var(--border);
        }
        .terminal-resize-handle:hover svg {
          color: var(--text-primary);
        }
        .terminal-action-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 4px;
          margin-left: auto;
          margin-right: 8px;
          transition: all 0.2s;
        }
        .terminal-action-btn:hover {
          color: var(--text-primary);
          background: rgba(255,255,255,0.1);
        }
      `}</style>
    </div>
  );
}

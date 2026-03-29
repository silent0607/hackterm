import { useEffect, useRef, useCallback, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { useSocket } from '../context/SocketContext';

const TERM_THEME = {
  background:  '#050508',
  foreground:  '#e0e0ff',
  black:       '#0a0a0f',
  red:         '#ff3b5c',
  green:       '#00ff88',
  yellow:      '#ffd60a',
  blue:        '#7b5cf6',
  magenta:     '#d97bff',
  cyan:        '#00d4ff',
  white:       '#c8c8e8',
  brightBlack: '#3a3a5a',
  brightRed:   '#ff6b7c',
  brightGreen: '#20ffa0',
  brightYellow:'#ffed4a',
  brightBlue:  '#9b7cff',
  brightMagenta:'#e89bff',
  brightCyan:  '#4deeff',
  brightWhite: '#ffffff',
  cursor:      '#00ff88',
  cursorAccent:'#050508',
  selection:   'rgba(139,92,246,0.3)',
};

export function useTerminal(termId, containerRef, options = {}) {
  const { socket } = useSocket();
  const termRef = useRef(null);
  const fitRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  const sendToTerminal = useCallback((text) => {
    if (socket && termId) socket.emit('terminal:write', { id: termId, data: text });
  }, [socket, termId]);

  const writeCommand = useCallback((cmd) => {
    if (socket && termId) socket.emit('terminal:write', { id: termId, data: cmd });
  }, [socket, termId]);

  useEffect(() => {
    if (!containerRef.current || !socket || !termId) return;

    const term = new Terminal({
      theme: TERM_THEME,
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      fontSize: 13,
      lineHeight: 1.4,
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 5000,
      allowProposedApi: true,
      ...options
    });

    const fit = new FitAddon();
    const links = new WebLinksAddon();
    term.loadAddon(fit);
    term.loadAddon(links);
    term.open(containerRef.current);

    // Keyboard Shortcuts (Copy/Paste)
    term.attachCustomKeyEventHandler((e) => {
      if (e.ctrlKey && e.shiftKey && e.type === 'keydown') {
        if (e.code === 'KeyC') {
          const selection = term.getSelection();
          if (selection) {
            navigator.clipboard.writeText(selection).catch(() => {});
          }
          return false;
        }
        if (e.code === 'KeyV') {
          navigator.clipboard.readText().then(text => {
            socket.emit('terminal:write', { id: termId, data: text });
          }).catch(() => {});
          return false;
        }
      }
      return true;
    });

    // Initial Fit with a tiny delay to ensure DOM is settled
    const initialFit = setTimeout(() => {
      try {
        fit.fit();
        term.refresh(0, term.rows - 1);
      } catch (e) {}
    }, 100);

    termRef.current = term;
    fitRef.current = fit;

    // PTY data → xterm
    const dataHandler = (data) => term.write(data);
    socket.on(`terminal:data:${termId}`, dataHandler);

    const readyHandler = () => setIsReady(true);
    socket.on(`terminal:ready:${termId}`, readyHandler);

    const exitHandler = () => {
      term.write('\r\n\x1b[33m[Bağlantı kapandı]\x1b[0m\r\n');
      setIsReady(false);
    };
    socket.on(`terminal:exit:${termId}`, exitHandler);

    // xterm → PTY
    term.onData((data) => {
      socket.emit('terminal:write', { id: termId, data });
    });

    // Resize with safety
    const ro = new ResizeObserver(() => {
      if (!fitRef.current) return;
      setTimeout(() => {
        try {
          fitRef.current.fit();
          const { cols, rows } = term;
          socket.emit('terminal:resize', { id: termId, cols, rows });
          term.refresh(0, term.rows - 1);
        } catch {}
      }, 50);
    });
    if (containerRef.current) ro.observe(containerRef.current);

    // Create PTY
    socket.emit('terminal:create', {
      id: termId,
      shell: options.shell,
      venv: options.venv || false
    });

    return () => {
      clearTimeout(initialFit);
      socket.off(`terminal:data:${termId}`, dataHandler);
      socket.off(`terminal:ready:${termId}`, readyHandler);
      socket.off(`terminal:exit:${termId}`, exitHandler);
      ro.disconnect();
      term.dispose();
      termRef.current = null;
      fitRef.current = null;
    };
  }, [socket, termId]);

  return { term: termRef.current, isReady, sendToTerminal, writeCommand };
}

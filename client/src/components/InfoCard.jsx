import { useState } from 'react';
import { ChevronDown, ChevronRight, Copy, Terminal } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { sendCmd } from '../utils/helpers';

export function InfoCard({ title, icon, children, defaultOpen = false, color = 'purple' }) {
  const [open, setOpen] = useState(defaultOpen);
  const colorMap = { purple: 'var(--text-purple)', green: 'var(--accent-green)', orange: 'var(--accent-orange)', cyan: 'var(--accent-cyan)' };
  return (
    <div className="info-panel" style={{ marginBottom: 12 }}>
      <div className="info-panel-header" onClick={() => setOpen(o => !o)}
        style={{ color: colorMap[color] || 'var(--text-purple)' }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span style={{ flex: 1 }}>{title}</span>
        {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
      </div>
      {open && <div className="info-panel-body">{children}</div>}
    </div>
  );
}

export function CmdLine({ cmd, desc, termId, prefix = '' }) {
  const { socket } = useSocket();
  const [copied, setCopied] = useState(false);

  const fullCmd = prefix ? `${prefix} ${cmd}` : cmd;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSend = () => {
    if (termId) sendCmd(socket, termId, fullCmd);
  };

  return (
    <div style={{ marginBottom: 12 }}>
      {desc && <div className="cmd-desc">{desc}</div>}
      <div className="cmd-row">
        <div className="cmd-box">{fullCmd}</div>
        <button className="cmd-send-btn" onClick={handleCopy} title="Kopyala">
          {copied ? '✓' : <Copy size={11} />}
        </button>
        {termId && (
          <button className="cmd-send-btn" onClick={handleSend} title="Terminale gönder (Enter'a sen bas)">
            <Terminal size={11} />
          </button>
        )}
      </div>
    </div>
  );
}

export function SectionTitle({ children, icon }) {
  return (
    <div className="section-title">
      {icon && <span>{icon}</span>}
      {children}
    </div>
  );
}

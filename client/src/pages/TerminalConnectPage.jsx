import { useState, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useTerminal } from '../hooks/useTerminal';

let sshCounter = 100;

function SshTerminal({ id, title }) {
  const containerRef = useRef(null);
  const { isReady } = useTerminal(id, containerRef, { shell: '/bin/bash' });
  return (
    <div className="terminal-container" style={{ height: 300 }}>
      <div className="terminal-titlebar">
        <div className="terminal-dots">
          <div className="terminal-dot red" /><div className="terminal-dot yellow" /><div className="terminal-dot green" />
        </div>
        <div className="terminal-title">
          {isReady ? <span style={{ color: 'var(--accent-green)' }}>● {title}</span> : <span style={{ color: 'var(--text-muted)' }}>○ bağlanıyor...</span>}
        </div>
      </div>
      <div ref={containerRef} style={{ height: 262, padding: '4px 2px' }} />
    </div>
  );
}

export default function TerminalConnectPage({ onBack }) {
  const { socket } = useSocket();
  const [tab, setTab] = useState('local');
  const [sshHost, setSshHost] = useState('');
  const [sshPort, setSshPort] = useState('22');
  const [sshUser, setSshUser] = useState('root');
  const [sshPass, setSshPass] = useState('');
  const [dockerId, setDockerId] = useState('');
  const [sessions, setSessions] = useState([]);
  const [venv, setVenv] = useState(false);

  const addLocalTerm = () => {
    sshCounter++;
    setSessions(p => [...p, { id: `local-${sshCounter}`, title: venv ? 'bash (venv)' : 'bash', type: 'local' }]);
  };

  const connectSsh = () => {
    if (!sshHost) return;
    sshCounter++;
    const id = `ssh-${sshCounter}`;
    socket.emit('ssh:connect', { id, host: sshHost, port: parseInt(sshPort), username: sshUser, password: sshPass });
    setSessions(p => [...p, { id, title: `ssh:${sshHost}`, type: 'ssh' }]);
  };

  const connectDocker = () => {
    if (!dockerId) return;
    sshCounter++;
    const id = `docker-${sshCounter}`;
    setSessions(p => [...p, { id, title: `docker:${dockerId.slice(0, 8)}`, type: 'docker' }]);
    // Docker exec handled by local PTY with docker exec
    socket.emit('terminal:create', { id, shell: `/usr/bin/docker exec -it ${dockerId} /bin/bash` });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-back" onClick={onBack}>← Ana Menü</div>
          <div className="page-title">⬡ <span>Terminal Bağla</span></div>
          <div className="page-subtitle">Yerel, SSH veya Docker terminal bağlantısı</div>
        </div>
      </div>

      <div className="page-tabs" style={{ marginBottom: 16 }}>
        {['local', 'ssh', 'docker'].map(t => (
          <div key={t} className={`page-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'local' ? '🐧 Linux (Yerel)' : t === 'ssh' ? '🔐 SSH (Uzak)' : '🐳 Docker'}
          </div>
        ))}
      </div>

      {tab === 'local' && (
        <div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
            <button className="btn btn-green" onClick={addLocalTerm}>
              + Yeni Yerel Terminal
            </button>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input type="checkbox" checked={venv} onChange={e => setVenv(e.target.checked)} style={{ accentColor: 'var(--accent-purple)' }} />
              Sanal ortam (venv) aktif
            </label>
          </div>
        </div>
      )}

      {tab === 'ssh' && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 16 }}>
          <div className="form-group" style={{ flex: 2, minWidth: 160 }}>
            <label className="form-label">Host / IP</label>
            <input className="form-input" value={sshHost} onChange={e => setSshHost(e.target.value)} placeholder="10.10.10.10" />
          </div>
          <div className="form-group" style={{ minWidth: 70 }}>
            <label className="form-label">Port</label>
            <input className="form-input" value={sshPort} onChange={e => setSshPort(e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 100 }}>
            <label className="form-label">Kullanıcı</label>
            <input className="form-input" value={sshUser} onChange={e => setSshUser(e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 100 }}>
            <label className="form-label">Parola</label>
            <input className="form-input" type="password" value={sshPass} onChange={e => setSshPass(e.target.value)} placeholder="parola" />
          </div>
          <button className="btn btn-purple" onClick={connectSsh}>🔐 SSH Bağlan</button>
        </div>
      )}

      {tab === 'docker' && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginBottom: 16, flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Container ID / İsim</label>
            <input className="form-input" value={dockerId} onChange={e => setDockerId(e.target.value)} placeholder="container_isim veya sha256" />
          </div>
          <button className="btn btn-cyan" onClick={connectDocker}>🐳 Docker Exec</button>
        </div>
      )}

      {sessions.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', borderRadius: 12, border: '1px dashed var(--border)', marginTop: 8 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⬡</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 12 }}>Yukarıdan terminal ekle</div>
        </div>
      )}

      {sessions.map(s => (
        <div key={s.id} style={{ marginBottom: 16 }}>
          <SshTerminal id={s.id} title={s.title} />
        </div>
      ))}
    </div>
  );
}

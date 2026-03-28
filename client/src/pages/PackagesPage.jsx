import { useState, useEffect, useRef } from 'react';
import { Download, Terminal, Settings2 } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useLanguage } from '../context/LanguageContext';

const PACKAGES = [
  { id: 'nmap', name: 'Nmap', cmd: 'nmap', desc: 'Ağ tarayıcı ve güvenlik tarayıcı.' },
  { id: 'ftp', name: 'FTP', cmd: 'ftp', desc: 'Dosya transfer protokolü istemcisi.' },
  { id: 'firefox', name: 'Firefox', cmd: 'firefox', desc: 'Web tarayıcısı (noVNC için gerekli).' },
  { id: 'gobuster', name: 'Gobuster', cmd: 'gobuster', desc: 'Dizin ve DNS brute-force aracı.' },
  { id: 'smbclient', name: 'Smbclient', cmd: 'smbclient', desc: 'SMB ağ paylaşım aracı.' },
  { id: 'redis-tools', name: 'Redis CLI', cmd: 'redis-tools', desc: 'Redis veritabanı yönetim aracı.' },
];

export default function PackagesPage() {
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const { socket } = useSocket();
  const { t } = useLanguage();
  const logEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;
    
    const handleLog = (data) => {
      setLogs(prev => [...prev, data]);
      setTimeout(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    };
    
    const handleDone = (code) => {
      setLogs(prev => [...prev, `\n\r>>> İşlem bitti (Çıkış Kodu: ${code}) <<<\n\r`]);
      setIsRunning(false);
    };

    socket.on('package:log', handleLog);
    socket.on('package:done', handleDone);

    return () => {
      socket.off('package:log', handleLog);
      socket.off('package:done', handleDone);
    };
  }, [socket]);

  const sendCommand = (action, pkg) => {
    if (isRunning) return;
    setIsRunning(true);
    setLogs([`\n\r>>> Başlatılıyor: apt-get ${action} ${pkg || ''} <<<\n\r`]);
    fetch('/api/packages/install', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, pkg })
    });
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ paddingBottom: 16 }}>
        <div>
          <h1 className="page-title"><Download size={22} style={{ verticalAlign: 'middle', marginRight: 12, color: 'var(--accent-purple)' }}/> {t('packages_title')}</h1>
          <p className="page-subtitle">{t('packages_desc')}</p>
        </div>
      </div>
      
      <div style={{ padding: '0 20px', display: 'flex', gap: 12, marginBottom: 24 }}>
        <button className="btn-pro btn-outline" disabled={isRunning} onClick={() => sendCommand('update')}>
          <Settings2 size={16} /> Update (Recommended)
        </button>
        <button className="btn-pro btn-cyan" disabled={isRunning} onClick={() => sendCommand('upgrade')}>
          <Download size={16} /> Upgrade (System)
        </button>
      </div>

      <div className="notes-grid" style={{ padding: '0 20px', marginBottom: 24 }}>
        {PACKAGES.map(p => (
          <div key={p.id} className="note-card glass-card" style={{ minHeight: 140 }}>
            <div>
              <div className="note-card-header" style={{ fontSize: 15 }}>{p.name}</div>
              <div className="note-card-excerpt" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.desc}</div>
            </div>
            <button className="btn-pro btn-cyan btn-xs btn-full" disabled={isRunning} onClick={() => sendCommand('install', p.cmd)} style={{ marginTop: 12 }}>
              <Download size={12} /> {t('install')} ({p.cmd})
            </button>
          </div>
        ))}
      </div>

      {/* Embedded Log Terminal */}
      <div style={{ flex: 1, padding: '0 20px 20px 20px', minHeight: 0 }}>
        <div className="terminal-pro" style={{ height: '100%' }}>
          <div className="terminal-pro-header">
            <div className="terminal-dot red" />
            <div className="terminal-dot yellow" />
            <div className="terminal-dot green" />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginLeft: 12 }}>Apt-Get Pro Installer Console</span>
          </div>
          <div style={{
            flex: 1,
            background: 'transparent',
            padding: 16, overflowY: 'auto', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#4ade80', whiteSpace: 'pre-wrap', wordWrap: 'break-word'
          }}>
            {logs.length ? logs.join('') : '> ' + (t('console_ready') || 'Konsol hazır. İşlem logları burada görünecek...')}
            <div ref={logEndRef} />
          </div>
        </div>
      </div>

    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { Download, Terminal, Settings2, Search, CheckCircle2, Loader2, PackageSearch } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useLanguage } from '../context/LanguageContext';

const PACKAGES = [
  { id: 'nmap', name: 'Nmap', descKey: 'c_nmap' },
  { id: 'ftp', name: 'FTP', descKey: 'c_ftp' },
  { id: 'firefox', name: 'Firefox', descKey: 'pkg_firefox' },
  { id: 'gobuster', name: 'Gobuster', descKey: 'c_gobuster' },
  { id: 'smbclient', name: 'Smbclient', descKey: 'c_smbclient' },
  { id: 'redis', name: 'Redis CLI', descKey: 'c_redis' },
  { id: 'wireshark', name: 'Wireshark', descKey: 'c_wireshark' },
  { id: 'nc', name: 'Netcat (nc)', descKey: 'nc_desc' },
  { id: 'mysql', name: 'MySQL Client', descKey: 'mysql_desc' },
  { id: 'john', name: 'John the Ripper', descKey: 'john_desc' },
  { id: 'hashcat', name: 'Hashcat', descKey: 'hashcat_desc' },
  { id: 'awscli', name: 'AWS CLI', descKey: 'aws_desc' },
  { id: 'impacket', name: 'Impacket', descKey: 'impacket_desc' },
  { id: 'evilwinrm', name: 'Evil-WinRM', descKey: 'evil_winrm_desc' },
  { id: 'responder', name: 'Responder', descKey: 'responder_desc' }
];

export default function PackagesPage() {
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [marketStatus, setMarketStatus] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [installingTool, setInstallingTool] = useState(null);
  
  const { socket } = useSocket();
  const { t } = useLanguage();
  const logEndRef = useRef(null);
  const termId = 'market-install-logs';

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/market/status');
      if (res.ok) {
        const data = await res.json();
        setMarketStatus(data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    const handleLog = (data) => {
      setLogs(prev => [...prev, data]);
      setTimeout(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    };

    const handleFinal = () => {
      setIsRunning(false);
      setInstallingTool(null);
      fetchStatus();
    };
    
    if (socket) {
      socket.on(`terminal:data:${termId}`, handleLog);
      socket.on('market:final', handleFinal);
    }

    return () => {
      if (socket) {
        socket.off(`terminal:data:${termId}`, handleLog);
        socket.off('market:final', handleFinal);
      }
    };
  }, [socket, t, termId]);

  const sendInstall = async (toolId, name) => {
    if (isRunning) return;
    setIsRunning(true);
    setInstallingTool(toolId);
    setLogs([`\n\r>>> ${name} ${t('installing') || 'Yükleniyor'}... <<<\n\r`]);
    
    try {
      await fetch('/api/market/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: toolId, termId })
      });
    } catch (e) {}
    
    // We don't have a direct 'done' callback from market/install 
    // yet but we can assume it's running. The logs will finish it.
    // For UI simplicity, we keep isRunning true until something happens or just poll.
    setTimeout(fetchStatus, 5000); 
    setTimeout(() => setIsRunning(false), 30000); // safety reset
  };

  const filteredPackages = PACKAGES.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t(p.descKey).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ paddingBottom: 16 }}>
        <div>
          <h1 className="page-title"><Download size={22} style={{ verticalAlign: 'middle', marginRight: 12, color: 'var(--accent-purple)' }}/> {t('packages_title')}</h1>
          <p className="page-subtitle">{t('packages_desc')}</p>
        </div>
      </div>
      
      <div style={{ padding: '0 20px', marginBottom: 24, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 36, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
          <Search size={18} />
        </div>
        <input 
          type="text" 
          placeholder={t('search_tools_market') || 'Market içerisinde ara...'} 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="glass-input"
          style={{
            width: '100%',
            padding: '12px 16px 12px 48px',
            fontSize: 14,
            borderRadius: 12,
            background: 'var(--panel-bg)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)'
          }}
        />
      </div>

      <div className="notes-grid" style={{ padding: '0 20px', marginBottom: 24 }}>
        {filteredPackages.map(p => (
          <div key={p.id} className="note-card glass-card" style={{ minHeight: 140, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div className="note-card-header" style={{ fontSize: 15, margin: 0 }}>{p.name}</div>
                {marketStatus[p.id] && <CheckCircle2 size={16} style={{ color: 'var(--accent-green)' }} />}
              </div>
              <div className="note-card-excerpt" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t(p.descKey)}</div>
            </div>
            
            {marketStatus[p.id] ? (
              <div style={{ 
                marginTop: 12, 
                padding: '6px 12px', 
                borderRadius: 8, 
                background: 'rgba(0,255,136,0.05)', 
                color: 'var(--accent-green)',
                fontSize: 11,
                fontWeight: 600,
                textAlign: 'center',
                border: '1px solid rgba(0,255,136,0.1)'
              }}>
                {t('installed') || 'KURULU'}
              </div>
            ) : (
              <button 
                className="btn-pro btn-cyan btn-xs btn-full" 
                disabled={isRunning} 
                onClick={() => sendInstall(p.id, p.name)}
                style={{ marginTop: 12, background: 'transparent', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)' }}
              >
                {isRunning && installingTool === p.id ? <Loader2 size={12} className="spin" /> : <><Download size={12} /> {t('install')}</>}
              </button>
            )}
          </div>
        ))}
        {filteredPackages.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            {t('no_tools_found')}
          </div>
        )}
      </div>

      {/* Embedded Log Terminal */}
      <div style={{ flex: 1, padding: '0 20px 20px 20px', minHeight: 0 }}>
        <div className="terminal-pro" style={{ height: '100%' }}>
          <div className="terminal-pro-header">
            <div className="terminal-dot red" />
            <div className="terminal-dot yellow" />
            <div className="terminal-dot green" />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginLeft: 12 }}>{t('pkg_console')}</span>
          </div>
          <div style={{
            flex: 1,
            background: 'transparent',
            padding: 16, overflowY: 'auto', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#4ade80', whiteSpace: 'pre-wrap', wordWrap: 'break-word'
          }}>
            {logs.length ? logs.join('') : '> ' + t('pkg_ready')}
            <div ref={logEndRef} />
          </div>
        </div>
      </div>

    </div>
  );
}

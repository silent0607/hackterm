import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useJobs } from '../context/JobContext';
import { useLanguage } from '../context/LanguageContext';
import { InfoCard, SectionTitle, CmdLine } from '../components/InfoCard';
import { LayoutGrid, Monitor, Play, FileText, Search, ShieldAlert, Cpu } from 'lucide-react';
import Terminal from '../components/Terminal';

export default function MetasploitPage({ onBack }) {
  const { t } = useLanguage();
  const { socket } = useSocket();
  const { activeJobId, jobs } = useJobs();
  const [running, setRunning] = useState(false);
  const termId = `msf-${activeJobId || 'default'}`;

  const currentJob = jobs.find(j => j.id === activeJobId);
  const target = currentJob?.ip || '';

  const handleLaunch = () => {
    setRunning(true);
    if (socket) {
      socket.emit('terminal:create', { id: termId });
      socket.emit(`terminal:input:${termId}`, 'msfconsole -q\n');
    }
  };

  const handleQuickModule = (module) => {
    if (!target) return alert(t('select_job_error'));
    setRunning(true);
    
    let cmd = '';
    switch (module) {
      case 'portscan': cmd = `msfconsole -q -x "use auxiliary/scanner/portscan/tcp; set RHOSTS ${target}; run; exit"\n`; break;
      case 'smb': cmd = `msfconsole -q -x "use auxiliary/scanner/smb/smb_version; set RHOSTS ${target}; run; exit"\n`; break;
    }

    if (socket) {
      socket.emit('terminal:create', { id: termId });
      socket.emit(`terminal:input:${termId}`, cmd);
    }
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      <div className="page-header">
        <div>
          <div className="page-header-back" onClick={onBack}>{t('back_to_menu')}</div>
          <div className="page-title"><Cpu size={24} style={{ verticalAlign: 'middle', marginRight: 12, color: 'var(--accent-red)' }}/> <span>Metasploit Framework</span></div>
          <div className="page-subtitle">The world's most used penetration testing framework.</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div>
          <SectionTitle icon={<Play size={16} />}>Framework Console</SectionTitle>
          <div className="info-panel" style={{ padding: 20 }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              Launch the MSF console below to start the exploit engine. 
              Note: Cold startup may take 5-10 seconds.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button className="btn-pro btn-red btn-full" onClick={handleLaunch}>
                <Monitor size={16} /> {t('launch_console') || 'Konsolu Başlat'}
              </button>
              <button className="btn-pro btn-outline btn-full" onClick={() => handleQuickModule('portscan')}>
                <Search size={16} /> TCP Port Scan
              </button>
            </div>
          </div>
        </div>

        <InfoCard title="Quick Setup Guide" icon={<ShieldAlert size={16} />} color="red">
          <p style={{ fontSize: 13 }}>
            Metasploit contains over 2000 exploits and auxiliary modules. 
            Before running any exploit, always check your LHOST/RHOST settings.
          </p>
          <div style={{ marginTop: 10 }}>
            <CmdLine cmd="msfupdate" />
          </div>
        </InfoCard>
      </div>

      <Terminal id={termId} title="Metasploit Console" />

      <div style={{ marginTop: 24 }}>
        <SectionTitle icon={<FileText size={16} />}>Common MSF Commands</SectionTitle>
        <div className="info-panel" style={{ padding: 0 }}>
          <table className="pro-table">
            <thead>
              <tr>
                <th>Command</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><code className="code-tag">search [name]</code></td><td>Search for a module or exploit</td></tr>
              <tr><td><code className="code-tag">use [path]</code></td><td>Select a module</td></tr>
              <tr><td><code className="code-tag">set [option] [value]</code></td><td>Define a parameter (RHOSTS, LHOST, etc.)</td></tr>
              <tr><td><code className="code-tag">show options</code></td><td>Display required parameters for current module</td></tr>
              <tr><td><code className="code-tag">run / exploit</code></td><td>Execute the selected module</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

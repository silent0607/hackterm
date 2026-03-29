import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useJobs } from '../context/JobContext';
import { useLanguage } from '../context/LanguageContext';
import { InfoCard, SectionTitle, CmdLine } from '../components/InfoCard';
import { Shield, ShieldAlert, Terminal as TermIcon, Play, Monitor, Activity, Settings } from 'lucide-react';
import Terminal from '../components/Terminal';

export default function OpenVasPage({ onBack }) {
  const { t } = useLanguage();
  const { socket } = useSocket();
  const { activeJobId } = useJobs();
  const [running, setRunning] = useState(false);
  const termId = `openvas-${activeJobId || 'default'}`;

  // OpenVAS (GVM) Web UI is usually on port 9392 or similar
  // Note: GVM is extremely heavy. This page provides a controller for it.
  const gvmUrl = `https://${window.location.hostname}:9392`;

  const handleStartServices = () => {
    setRunning(true);
    if (socket) {
      socket.emit('terminal:create', { id: termId });
      socket.emit(`terminal:input:${termId}`, 'gvm-start\n');
    }
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      <div className="page-header">
        <div>
          <div className="page-header-back" onClick={onBack}>{t('back_to_menu')}</div>
          <div className="page-title"><Shield size={24} style={{ verticalAlign: 'middle', marginRight: 12, color: 'var(--accent-green)' }}/> <span>OpenVAS / GVM</span></div>
          <div className="page-subtitle">Greenbone Vulnerability Manager - Enterprise Vulnerability Scanner.</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div>
          <SectionTitle icon={<Activity size={16} />}>Service Controller</SectionTitle>
          <div className="info-panel" style={{ padding: 20 }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              GVM services (gvmd, gsad, ospd-openvas) must be running to access the GUI. 
              Starting these services can take 1-2 minutes.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button className="btn-pro btn-green btn-full" onClick={handleStartServices}>
                <Play size={16} /> {t('start_services') || 'Servisleri Başlat'}
              </button>
              <button className="btn-pro btn-outline btn-full" onClick={() => window.open(gvmUrl, '_blank')}>
                <Monitor size={16} /> Open Web UI (9392)
              </button>
            </div>
          </div>
        </div>

        <InfoCard title="GVM Post-Install" icon={<ShieldAlert size={16} />} color="green">
          <p style={{ fontSize: 13 }}>
            After installation, use the following commands to sync feeds and create an admin user:
          </p>
          <div style={{ marginTop: 10 }}>
            <CmdLine cmd="gvm-setup" />
            <CmdLine cmd="gvm-check-setup" />
          </div>
        </InfoCard>
      </div>

      <Terminal id={termId} title="GVM System Log" height={180} />

      <div style={{ marginTop: 24 }}>
        <SectionTitle icon={<Settings size={16} />}>Admin Commands</SectionTitle>
        <div className="info-panel" style={{ padding: 0 }}>
          <table className="pro-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Command</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Create Admin</td><td><code className="code-tag">gvmd --create-user=[name] --password=[pass]</code></td></tr>
              <tr><td>Update Feeds</td><td><code className="code-tag">greenbone-feed-sync</code></td></tr>
              <tr><td>Check Status</td><td><code className="code-tag">gvm-check-setup</code></td></tr>
              <tr><td>Stop GVM</td><td><code className="code-tag">gvm-stop</code></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useJobs } from '../context/JobContext';
import { useLanguage } from '../context/LanguageContext';
import { InfoCard, SectionTitle } from '../components/InfoCard';
import { Monitor, Upload, Play, Package, ShieldCheck, Chrome } from 'lucide-react';
import Terminal from '../components/Terminal';

export default function BurpPage({ onBack }) {
  const { t } = useLanguage();
  const { socket } = useSocket();
  const { activeJobId } = useJobs();
  const [burpStatus, setBurpStatus] = useState({ installed: false });
  const [shFiles, setShFiles] = useState([]);
  const [envInfo, setEnvInfo] = useState({ novncPort: '6080', desktopEnv: 'xfce', desktopPath: '/desktop' });
  const [selectedFile, setSelectedFile] = useState('');
  const [installing, setInstalling] = useState(false);
  const [running, setRunning] = useState(false);

  const termId = `burp-${activeJobId || 'default'}`;

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/burp/status');
      const data = await res.json();
      setBurpStatus(data);
    } catch (e) {}
  };

  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/files/sh');
      const data = await res.json();
      setShFiles(data.files || []);
    } catch (e) {}
  };

  const fetchEnv = async () => {
    try {
      const res = await fetch('/api/env');
      const data = await res.json();
      setEnvInfo(data);
    } catch (e) {}
  };

  useEffect(() => {
    fetchStatus();
    fetchFiles();
    fetchEnv();
  }, []);

  const handleInstall = async () => {
    if (!selectedFile) return;
    setInstalling(true);
    try {
      await fetch('/api/burp/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: selectedFile, termId }) // Pass termId for logs
      });
      fetchStatus();
    } catch (e) {} finally { setInstalling(false); }
  };

  const handleRun = async () => {
    setRunning(true);
    try {
      await fetch('/api/burp/run', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ termId }) // Pass termId for logs
      });
    } catch (e) {} finally { setRunning(false); }
  };

  // Main desktop/Burp session (Port 6080)
  const vncUrl = `http://${window.location.hostname}:6080${envInfo.desktopPath}/vnc.html?host=${window.location.hostname}&port=6080&autoconnect=true`;
  // Dedicated Firefox session (Port 6081)
  const firefoxUrl = `http://${window.location.hostname}:6081${envInfo.desktopPath}/vnc.html?host=${window.location.hostname}&port=6081&autoconnect=true`;

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    try {
      await fetch('/api/upload', { method: 'POST', body: formData });
      fetchFiles();
    } catch (e) { alert(t('error')); }
  };

  const handleLaunchFirefox = async () => {
    try {
      await fetch('/api/firefox/launch', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ termId })
      });
      window.open(firefoxUrl, '_blank');
    } catch (e) {
      window.open(firefoxUrl, '_blank');
    }
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* ... previous headers ... */}
      <div className="page-header">
        <div>
          <div className="page-header-back" onClick={onBack}>{t('back_to_menu')}</div>
          <div className="page-title">🐝 <span>{t('burp_title')}</span></div>
          <div className="page-subtitle">{t('burp_desc')}</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div>
          <SectionTitle icon={<Package size={16} />}>{t('install_run')}</SectionTitle>
          <div className="info-panel" style={{ padding: 20, height: '100%' }}>
            {burpStatus.installed ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--accent-green)', fontWeight: 'bold', marginBottom: 16 }}>
                  ✅ {t('burp_installed')}
                </div>
                <button className="btn-pro btn-green" onClick={handleRun} disabled={running} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Play size={16} /> {running ? t('burp_running') : t('burp_run')}
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--accent-orange)', fontWeight: 'bold', marginBottom: 16 }}>
                  ⚠️ {t('burp_not_installed')}
                </div>
                <select className="form-input" style={{ marginBottom: 12 }} value={selectedFile} onChange={e => setSelectedFile(e.target.value)}>
                  <option value="">{t('burp_select_sh')}</option>
                  {shFiles.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-pro btn-cyan" onClick={handleInstall} disabled={installing || !selectedFile} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Package size={16} /> {installing ? t('burp_installing') : t('burp_install_btn')}
                  </button>
                  <label className="btn-pro btn-outline" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 12px' }}>
                    <Upload size={16} />
                    <input type="file" accept=".sh" style={{ display: 'none' }} onChange={handleUpload} />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <SectionTitle icon={<Monitor size={16} />}>{t('gui_desktop')}</SectionTitle>
          <div className="info-panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button onClick={() => window.open(vncUrl, '_blank')} className="btn-pro btn-cyan" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Monitor size={16} /> {t('desktop_open')} (VNC Port 6080)
                </button>
                <button onClick={handleLaunchFirefox} className="btn-pro btn-purple" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Chrome size={16} /> Firefox'u Aç (VNC Port 6081)
                </button>
            </div>
            
            <div style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
               <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{t('burp_ca_title')}</div>
               <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>{t('burp_ca_desc')}</p>
            </div>
          </div>
        </div>
      </div>

      <Terminal id={termId} title="Burp Suite Konsolu / Logs" height={280} />

      <div style={{ marginTop: 24 }}>
        <InfoCard title={t('usage_guide')} icon="💡" color="cyan">
          <div className="cmd-desc" style={{ fontSize: 13, lineHeight: 1.6 }}>
            <b>1. Firefox & Burp</b>: {t('guide_1')}<br/>
            <b>2. {t('burp_ca_title')}</b>: {t('guide_2')}<br/>
            <b>3. {t('gui_desktop')}</b>: {t('guide_3')}
          </div>
        </InfoCard>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { InfoCard, SectionTitle } from '../components/InfoCard';
import { Monitor, Upload, Play, Package, ExternalLink, ShieldCheck, Terminal as TerminalIcon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function BurpPage({ onBack }) {
  const { t } = useLanguage();
  const { socket } = useSocket();
  const [burpStatus, setBurpStatus] = useState({ installed: false });
  const [shFiles, setShFiles] = useState([]);
  const [envInfo, setEnvInfo] = useState({ novncPort: '6080', desktopEnv: 'xfce', desktopPath: '/desktop' });
  const [selectedFile, setSelectedFile] = useState('');
  const [installing, setInstalling] = useState(false);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const logEndRef = useRef(null);

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

  useEffect(() => {
    if (!socket) return;
    const handleLog = (data) => {
      setLogs(prev => [...prev, data]);
      setTimeout(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    };
    socket.on('package:log', handleLog);
    return () => socket.off('package:log', handleLog);
  }, [socket]);

  const vncUrl = `http://${window.location.hostname}:${envInfo.novncPort}${envInfo.desktopPath}/vnc.html?host=${window.location.hostname}&port=${envInfo.novncPort}&autoconnect=true`;

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

  const handleInstall = async () => {
    if (!selectedFile) return;
    setInstalling(true);
    setLogs([`>>> Burp Suite kurulumu başlatılıyor: ${selectedFile} <<<\n`]);
    try {
      await fetch('/api/burp/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: selectedFile })
      });
      fetchStatus();
    } catch (e) {} finally { setInstalling(false); }
  };

  const handleRun = async () => {
    setRunning(true);
    setLogs(prev => [...prev, `\n>>> Burp Suite çalıştırılıyor... <<<\n`]);
    try {
      await fetch('/api/burp/run', { method: 'POST' });
    } catch (e) {} finally { setRunning(false); }
  };

  const handleLaunchFirefox = async () => {
    try {
      await fetch('/api/firefox/launch', { method: 'POST' });
      window.open(vncUrl, '_blank');
    } catch (e) {
      window.open(vncUrl, '_blank');
    }
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      <div className="page-header">
        <div>
          <div className="page-header-back" onClick={onBack}>{t('back_to_menu')}</div>
          <div className="page-title">🐝 <span>{t('burp_title')}</span></div>
          <div className="page-subtitle">{t('burp_desc')}</div>
        </div>
      </div>

      <div className="grid-2">
        <div>
          <SectionTitle icon={<Package size={16} />}>{t('install_run')}</SectionTitle>
          <div className="info-panel" style={{ padding: 20 }}>
            {burpStatus.installed ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--accent-green)', fontWeight: 'bold', marginBottom: 16 }}>
                  ✅ {t('burp_installed')}
                </div>
                <button className="btn btn-green" onClick={handleRun} disabled={running} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
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
                <button className="btn btn-cyan" onClick={handleInstall} disabled={installing || !selectedFile} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Package size={16} /> {installing ? t('burp_installing') : t('burp_install_btn')}
                </button>
                <label className="btn btn-ghost" style={{ width: '100%', marginTop: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Upload size={16} /> {t('burp_upload')}
                  <input type="file" accept=".sh" style={{ display: 'none' }} onChange={handleUpload} />
                </label>
              </div>
            )}
          </div>
        </div>

        <div>
          <SectionTitle icon={<Monitor size={16} />}>{t('gui_desktop')}</SectionTitle>
          <div className="info-panel" style={{ padding: 20 }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              {t('desktop_access_desc')}
            </div>
            <button onClick={handleLaunchFirefox} className="btn btn-purple" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <ExternalLink size={16} /> {t('desktop_open')}
            </button>
            
            <div style={{ marginTop: 24 }}>
              <SectionTitle icon={<ShieldCheck size={14} />}>{t('burp_ca_title')}</SectionTitle>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <p style={{ fontSize: 12, marginBottom: 8 }}>{t('burp_ca_desc')}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                   <a href={vncUrl} target="_blank" className="btn btn-xs btn-ghost" style={{ width: '100%' }}>
                     {t('firefox_open')}
                   </a>
                   <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                     {t('go_to_burp')}
                   </div>
                   <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                     {t('import_cert')}
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <SectionTitle icon={<TerminalIcon size={16} />}>Burp Suite Konsolu</SectionTitle>
        <div className="terminal-pro" style={{ height: 300 }}>
          <div className="terminal-pro-header">
            <div className="terminal-dot red" />
            <div className="terminal-dot yellow" />
            <div className="terminal-dot green" />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginLeft: 12 }}>burp_logs.log</span>
          </div>
          <div style={{
            flex: 1,
            background: 'transparent',
            padding: 16, overflowY: 'auto', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#4ade80', whiteSpace: 'pre-wrap', wordWrap: 'break-word'
          }}>
            {logs.length ? logs.join('') : '> Bekleniyor...'}
            <div ref={logEndRef} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <InfoCard title={t('usage_guide')} icon="💡" color="cyan">
          <div className="cmd-desc">
            <b>1. Firefox & Burp</b>: {t('guide_1')}<br/><br/>
            <b>2. {t('burp_ca_title')}</b>: {t('guide_2')}<br/><br/>
            <b>3. {t('gui_desktop')}</b>: {t('guide_3')}
          </div>
        </InfoCard>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { InfoCard, SectionTitle } from '../components/InfoCard';
import { Monitor, Upload, Play, Package, ExternalLink, ShieldCheck } from 'lucide-react';

export default function BurpPage({ onBack }) {
  const { socket } = useSocket();
  const [burpStatus, setBurpStatus] = useState({ installed: false });
  const [shFiles, setShFiles] = useState([]);
  const [envInfo, setEnvInfo] = useState({ novncPort: '6080', desktopEnv: 'xfce' });
  const [selectedFile, setSelectedFile] = useState('');
  const [installing, setInstalling] = useState(false);
  const [running, setRunning] = useState(false);

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

  // desktopPath is something like "/desktop"
  const vncUrl = `http://${window.location.hostname}:${envInfo.novncPort}${envInfo.desktopPath}/vnc.html?host=${window.location.hostname}&port=${envInfo.novncPort}&autoconnect=true`;

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    try {
      await fetch('/api/upload', { method: 'POST', body: formData });
      fetchFiles();
    } catch (e) { alert('Upload hatası'); }
  };

  const handleInstall = async () => {
    if (!selectedFile) return;
    setInstalling(true);
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
    try {
      await fetch('/api/burp/run', { method: 'POST' });
    } catch (e) {} finally { setRunning(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-back" onClick={onBack}>← Ana Menü</div>
          <div className="page-title">🐝 <span>Burp Suite</span></div>
          <div className="page-subtitle">Web uygulama güvenlik testi aracı.</div>
        </div>
      </div>

      <div className="grid-2">
        <div>
          <SectionTitle icon={<Package size={16} />}>Kurulum & Çalıştırma</SectionTitle>
          <div className="info-panel" style={{ padding: 20 }}>
            {burpStatus.installed ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--accent-green)', fontWeight: 'bold', marginBottom: 16 }}>
                  ✅ Burp Suite Kurulu
                </div>
                <button className="btn btn-green" onClick={handleRun} disabled={running} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Play size={16} /> {running ? 'Başlatılıyor...' : 'Burp Suite Çalıştır'}
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--accent-orange)', fontWeight: 'bold', marginBottom: 16 }}>
                  ⚠️ Burp Suite Kurulu Değil
                </div>
                <select className="form-input" style={{ marginBottom: 12 }} value={selectedFile} onChange={e => setSelectedFile(e.target.value)}>
                  <option value="">-- .sh Kurulum Dosyası Seçin --</option>
                  {shFiles.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <button className="btn btn-cyan" onClick={handleInstall} disabled={installing || !selectedFile} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Package size={16} /> {installing ? 'Kuruluyor...' : 'Yükle ve Kur'}
                </button>
                <label className="btn btn-ghost" style={{ width: '100%', marginTop: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Upload size={16} /> .sh Installer Yükle
                  <input type="file" accept=".sh" style={{ display: 'none' }} onChange={handleUpload} />
                </label>
              </div>
            )}
          </div>
        </div>

        <div>
          <SectionTitle icon={<Monitor size={16} />}>Grafik Arayüz (Desktop)</SectionTitle>
          <div className="info-panel" style={{ padding: 20 }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              Burp Suite ve Firefox arayüzlerine erişmek için dahili masaüstü bağlantısını kullan:
            </div>
            <a href={vncUrl} target="_blank" className="btn btn-purple" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <ExternalLink size={16} /> Masaüstünü Aç (noVNC)
            </a>
            
            <div style={{ marginTop: 24 }}>
              <SectionTitle icon={<ShieldCheck size={14} />}>Burp CA Sertifikası</SectionTitle>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <p style={{ fontSize: 12, marginBottom: 8 }}>Burp proxy ile HTTPS trafiğini dinlemek için CA sertifikasını yükle:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                   <a href={vncUrl} target="_blank" className="btn btn-xs btn-ghost" style={{ width: '100%' }}>
                     1. Firefox'u Aç (VNC üzerinden)
                   </a>
                   <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                     2. Firefox'ta <code>http://burp</code> adresine git.
                   </div>
                   <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                     3. 'CA Certificate' indir ve Firefox ayarlarına (Certificates) aktar.
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <InfoCard title="Kullanım Rehberi" icon="💡" color="cyan">
          <div className="cmd-desc">
            <b>1. Firefox & Burp</b>: Konteyner içindeki Firefox, varsayılan olarak <code>127.0.0.1:8080</code> (Burp Proxy) adresine yönlendirilmiş durumdadır.<br/><br/>
            <b>2. Sertifika</b>: HTTPS trafiğini görebilmek için Burp sertifikasını Firefox'a bir kez eklemen yeterlidir.<br/><br/>
            <b>3. Masaüstü Erişimi</b>: 'Masaüstünü Aç' butonu ile tam teşekküllü bir Ubuntu masaüstüne (<b>{envInfo.desktopEnv.toUpperCase()}</b>) ulaşırsın. Burp Suite'i oradan kontrol edebilirsin.
          </div>
        </InfoCard>
      </div>
    </div>
  );
}

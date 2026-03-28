import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { InfoCard, SectionTitle } from '../components/InfoCard';
import { Upload, Shield, ShieldOff, Activity, FileCode } from 'lucide-react';

export default function OpenVpnPage({ onBack }) {
  const { socket } = useSocket();
  const [vpnStatus, setVpnStatus] = useState({ active: false, info: '' });
  const [ovpnFiles, setOvpnFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/vpn/status');
      const data = await res.json();
      setVpnStatus(data);
    } catch (e) {}
  };

  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/files/ovpn');
      const data = await res.json();
      setOvpnFiles(data.files || []);
    } catch (e) {}
  };

  useEffect(() => {
    fetchStatus();
    fetchFiles();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await fetch('/api/upload', { method: 'POST', body: formData });
      fetchFiles();
    } catch (e) {
      alert('Yükleme hatası');
    } finally {
      setUploading(false);
    }
  };

  const handleConnect = async () => {
    if (!selectedFile) return;
    try {
      await fetch('/api/vpn/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: selectedFile })
      });
      fetchStatus();
    } catch (e) {}
  };

  const handleDisconnect = async () => {
    try {
      await fetch('/api/vpn/disconnect', { method: 'POST' });
      fetchStatus();
    } catch (e) {}
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-back" onClick={onBack}>← Ana Menü</div>
          <div className="page-title">🛡️ <span>OpenVPN</span></div>
          <div className="page-subtitle">VPN bağlantılarını yönet ve güvenli ağlara eriş.</div>
        </div>
      </div>

      <div className="grid-2">
        <div>
          <SectionTitle icon={<Activity size={16} />}>Bağlantı Durumu</SectionTitle>
          <div className={`info-panel ${vpnStatus.active ? 'border-green' : 'border-red'}`} style={{ padding: 20, textAlign: 'center' }}>
            {vpnStatus.active ? (
              <Shield className="text-green" size={48} style={{ marginBottom: 12 }} />
            ) : (
              <ShieldOff className="text-red" size={48} style={{ marginBottom: 12 }} />
            )}
            <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: vpnStatus.active ? 'var(--accent-green)' : 'var(--accent-red)' }}>
              {vpnStatus.active ? 'Bağlantı Aktif' : 'Bağlı Değil'}
            </div>
            <pre style={{ fontSize: 10, background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 4, textAlign: 'left', overflowX: 'auto', maxHeight: 150 }}>
              {vpnStatus.info}
            </pre>
            <div style={{ marginTop: 16 }}>
              {vpnStatus.active ? (
                <button className="btn btn-red" onClick={handleDisconnect} style={{ width: '100%' }}>Bağlantıyı Kes</button>
              ) : (
                <button className="btn btn-green" onClick={handleConnect} disabled={!selectedFile} style={{ width: '100%' }}>Bağlan</button>
              )}
            </div>
          </div>
        </div>

        <div>
          <SectionTitle icon={<FileCode size={16} />}>Yapılandırma Dosyaları (.ovpn)</SectionTitle>
          <div className="info-panel" style={{ padding: 20 }}>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Yapılandırma Seç</label>
              <select className="form-input" value={selectedFile} onChange={e => setSelectedFile(e.target.value)}>
                <option value="">-- Dosya Seçin --</option>
                {ovpnFiles.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <div style={{ textAlign: 'center' }}>
              <label className="btn btn-cyan" style={{ width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Upload size={16} /> {uploading ? 'Yükleniyor...' : '.ovpn Yükle'}
                <input type="file" accept=".ovpn" style={{ display: 'none' }} onChange={handleUpload} disabled={uploading} />
              </label>
            </div>

            <div style={{ marginTop: 20, fontSize: 12, color: 'var(--text-muted)' }}>
              <div style={{ marginBottom: 8 }}><b>İpucu:</b></div>
              TryHackMe veya HackTheBox gibi platformlardan aldığın <code>.ovpn</code> dosyalarını buradan yükleyip doğrudan konteyner üzerinden ağa bağlanabilirsin.
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <InfoCard title="OpenVPN Hakkında" icon="ℹ️" color="purple">
          <div className="cmd-desc">
            OpenVPN bağlantısı kurulduğunda, tüm konteyner trafiği (Terminal, Nmap, Gobuster vb.) VPN üzerinden geçecektir.
            Bağlantı sorunları yaşıyorsanız terminalden <code>ip addr</code> komutu ile <code>tun0</code> arayüzünün oluşup oluşmadığını kontrol edin.
          </div>
        </InfoCard>
      </div>
    </div>
  );
}

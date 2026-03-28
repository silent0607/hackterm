import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { InfoCard, SectionTitle } from '../components/InfoCard';
import { Upload, Shield, ShieldOff, Activity, FileCode } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function OpenVpnPage({ onBack }) {
  const { t } = useLanguage();
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
      alert(t('error'));
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
          <div className="page-header-back" onClick={onBack}>{t('back_to_menu')}</div>
          <div className="page-title">🛡️ <span>{t('vpn_title')}</span></div>
          <div className="page-subtitle">{t('vpn_desc')}</div>
        </div>
      </div>

      <div className="grid-2">
        <div>
          <SectionTitle icon={<Activity size={16} />}>{t('vpn_status')}</SectionTitle>
          <div className={`info-panel ${vpnStatus.active ? 'border-green' : 'border-red'}`} style={{ padding: 20, textAlign: 'center' }}>
            {vpnStatus.active ? (
              <Shield className="text-green" size={48} style={{ marginBottom: 12 }} />
            ) : (
              <ShieldOff className="text-red" size={48} style={{ marginBottom: 12 }} />
            )}
            <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: vpnStatus.active ? 'var(--accent-green)' : 'var(--accent-red)' }}>
              {vpnStatus.active ? t('vpn_connected') : t('vpn_disconnected')}
            </div>
            <pre style={{ fontSize: 10, background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 4, textAlign: 'left', overflowX: 'auto', maxHeight: 150 }}>
              {vpnStatus.info}
            </pre>
            <div style={{ marginTop: 16 }}>
              {vpnStatus.active ? (
                <button className="btn btn-red" onClick={handleDisconnect} style={{ width: '100%' }}>{t('vpn_disconnect')}</button>
              ) : (
                <button className="btn btn-green" onClick={handleConnect} disabled={!selectedFile} style={{ width: '100%' }}>{t('vpn_connect')}</button>
              )}
            </div>
          </div>
        </div>

        <div>
          <SectionTitle icon={<FileCode size={16} />}>{t('vpn_title')} (.ovpn)</SectionTitle>
          <div className="info-panel" style={{ padding: 20 }}>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">{t('vpn_select_file')}</label>
              <select className="form-input" value={selectedFile} onChange={e => setSelectedFile(e.target.value)}>
                <option value="">{t('vpn_select_file')}</option>
                {ovpnFiles.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <div style={{ textAlign: 'center' }}>
              <label className="btn btn-cyan" style={{ width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Upload size={16} /> {uploading ? t('loading') : t('vpn_upload')}
                <input type="file" accept=".ovpn" style={{ display: 'none' }} onChange={handleUpload} disabled={uploading} />
              </label>
            </div>

            <div style={{ marginTop: 20, fontSize: 12, color: 'var(--text-muted)' }}>
              <div style={{ marginBottom: 8 }}><b>{t('de_tip')}:</b></div>
              {t('vpn_hint')}
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <InfoCard title={t('vpn_about_title')} icon="ℹ️" color="purple">
          <div className="cmd-desc">
            {t('vpn_about_desc')}<br/><br/>
            {t('vpn_ip_check')}
          </div>
        </InfoCard>
      </div>
    </div>
  );
}

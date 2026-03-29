import { useState, useEffect } from 'react';
import { Settings, Layout, CheckCircle2, Circle, Loader2, PlayCircle, MonitorStop, PackageSearch } from 'lucide-react';
import { SectionTitle, InfoCard } from '../components/InfoCard';
import { useLanguage } from '../context/LanguageContext';
import Terminal from '../components/Terminal';

export default function SettingsPage() {
  const { t } = useLanguage();
  const [status, setStatus] = useState({ xfce: false, gnome: false });
  const [marketStatus, setMarketStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [installingType, setInstallingType] = useState(null);
  const [message, setMessage] = useState('');
  
  const termId = 'desktop-install-logs';

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/desktop/status');
      const data = await res.json();
      setStatus(data);

      const mRes = await fetch('/api/market/status');
      if (mRes.ok) {
        const mData = await mRes.json();
        setMarketStatus(mData);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const handleInstall = async (type) => {
    setLoading(true);
    setInstallingType(type);
    setMessage(type === 'xfce' ? `${t('xfce_desc')} ${t('installing')}` : `${t('gnome_desc')} ${t('installing')}`);
    
    try {
      const res = await fetch('/api/desktop/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, termId }) // Pass termId to see logs
      });
      const data = await res.json();
      setMessage(data.message);
    } catch (e) {
      setMessage(`error: ${t('error')}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInstallTool = async (tool, displayName) => {
    setLoading(true);
    setInstallingType(`tool_${tool}`);
    setMessage(`${displayName} yükleniyor...`);
    
    try {
      const res = await fetch('/api/market/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool, termId })
      });
      const data = await res.json();
      setMessage(data.message);
    } catch (e) {
      setMessage(`error: ${t('error')}`);
    } finally {
      setLoading(false);
      fetchStatus();
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title"><Settings size={24} /> <span>{t('system_settings')}</span></div>
          <div className="page-subtitle">{t('desktop_mgmt')}</div>
        </div>
      </div>

      <div className="grid-2">
        <div>
          <SectionTitle icon={<Layout size={18} />}>{t('de_title')}</SectionTitle>
          <div className="info-panel" style={{ padding: 20 }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              {t('de_desc')}
            </p>

            <div className="desktop-card" style={{ 
              background: 'var(--card-bg)', 
              border: '1px solid var(--border)', 
              borderRadius: 8, 
              padding: 16, 
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <b style={{ color: 'var(--accent-cyan)' }}>Xfce4 Desktop</b>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t('xfce_desc')}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {status.xfce ? (
                  <span style={{ color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                    <CheckCircle2 size={14} /> {t('installed')}
                  </span>
                ) : (
                  <button 
                    className="btn btn-xs btn-cyan" 
                    onClick={() => handleInstall('xfce')}
                    disabled={loading}
                  >
                    {loading && installingType === 'xfce' ? <Loader2 size={12} className="spin" /> : t('install')}
                  </button>
                )}
              </div>
            </div>

            <div className="desktop-card" style={{ 
              background: 'var(--card-bg)', 
              border: '1px solid var(--border)', 
              borderRadius: 8, 
              padding: 16, 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <b style={{ color: 'var(--accent-cyan)' }}>GNOME Flashback</b>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t('gnome_desc')}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {status.gnome ? (
                  <span style={{ color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                    <CheckCircle2 size={14} /> {t('installed')}
                  </span>
                ) : (
                  <button 
                    className="btn btn-xs btn-cyan" 
                    onClick={() => handleInstall('gnome')}
                    disabled={loading}
                  >
                    {loading && installingType === 'gnome' ? <Loader2 size={12} className="spin" /> : t('install')}
                  </button>
                )}
              </div>
            </div>

            {message && (
              <div style={{ 
                marginTop: 20, 
                padding: 12, 
                borderRadius: 4, 
                background: 'rgba(0,184,212,0.1)', 
                color: 'var(--accent-cyan)', 
                fontSize: 12,
                border: '1px solid rgba(0,184,212,0.2)'
              }}>
                {message}
              </div>
            )}
          </div>
        </div>

        <div>
           <InfoCard title={t('de_status_title')} icon="🖥️" color="purple">
              <div className="cmd-desc">
                <b>Mevcut WM:</b> Fluxbox (Aktif)<br/><br/>
                <b>İpucu:</b> {t('de_tip')}<br/><br/>
                <b>Dikkat:</b> {t('de_warning')}
              </div>
           </InfoCard>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <SectionTitle icon={<PackageSearch size={18} />}>Paket Market (Siber Güvenlik Araçları)</SectionTitle>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: 16,
          background: 'transparent',
          padding: 0,
          borderRadius: 8
        }}>
          {[
            { id: 'nc', name: 'Netcat', desc: 'Ağ üzerinde veri okuma ve yazma aracı' },
            { id: 'mysql', name: 'MySQL Client', desc: 'Veritabanı bağlantı aracı' },
            { id: 'john', name: 'John the Ripper', desc: 'Gelişmiş şifre kırma yazılımı' },
            { id: 'hashcat', name: 'Hashcat', desc: 'Dünyanın en hızlı parola kırıcısı' },
            { id: 'awscli', name: 'AWS CLI', desc: 'Amazon Web Services komut aracı' },
            { id: 'impacket', name: 'Impacket', desc: 'Ağ protokolleri için Python kütüphanesi' },
            { id: 'evilwinrm', name: 'Evil-WinRM', desc: 'Windows Remote Management aracı' },
            { id: 'smbclient', name: 'SMBclient', desc: 'SMB/CIFS paylaşımlarına erişim' },
            { id: 'responder', name: 'Responder', desc: 'Ağ üzerinde zehirlenme aracı' }
          ].map(app => (
            <div key={app.id} style={{
              background: 'var(--panel-bg)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div style={{ marginBottom: 16 }}>
                <b style={{ color: 'var(--accent-cyan)' }}>{app.name}</b>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{app.desc}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {marketStatus[app.id] ? (
                  <span style={{ color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                    <CheckCircle2 size={14} /> Kurulu
                  </span>
                ) : (
                  <button 
                    className="btn btn-xs btn-cyan" 
                    onClick={() => handleInstallTool(app.id, app.name)}
                    disabled={loading}
                    style={{ background: 'transparent', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)'}}
                  >
                    {loading && installingType === `tool_${app.id}` ? <Loader2 size={12} className="spin" /> : 'İndir & Kur'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <SectionTitle icon={<Settings size={18} />}>Kurulum Logları</SectionTitle>
        <Terminal id={termId} title="Installation Terminal / Logs" height={260} />
      </div>
    </div>
  );
}

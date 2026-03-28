import { useState, useEffect } from 'react';
import { Settings, Layout, CheckCircle2, Circle, Loader2, PlayCircle, MonitorStop } from 'lucide-react';
import { SectionTitle, InfoCard } from '../components/InfoCard';
import { useLanguage } from '../context/LanguageContext';

export default function SettingsPage() {
  const { t } = useLanguage();
  const [status, setStatus] = useState({ xfce: false, gnome: false });
  const [loading, setLoading] = useState(false);
  const [installingType, setInstallingType] = useState(null);
  const [message, setMessage] = useState('');

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/desktop/status');
      const data = await res.json();
      setStatus(data);
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
        body: JSON.stringify({ type })
      });
      const data = await res.json();
      setMessage(data.message);
    } catch (e) {
      setMessage(`error: ${t('error')}`);
    } finally {
      setLoading(false);
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
                <b>Mevcut WM:</b> Openbox (Aktif)<br/><br/>
                <b>İpucu:</b> {t('de_tip')}<br/><br/>
                <b>Dikkat:</b> {t('de_warning')}
              </div>
           </InfoCard>
        </div>
      </div>
    </div>
  );
}

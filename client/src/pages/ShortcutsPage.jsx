import { useState, useEffect } from 'react';
import { Keyboard, Save, Trash2, Info, Loader2 } from 'lucide-react';
import { SectionTitle, InfoCard } from '../components/InfoCard';
import { useLanguage } from '../context/LanguageContext';

const TOOLS = [
  { id: 'terminal', label: 'tool_terminal' },
  { id: 'nmap', label: 'tool_nmap' },
  { id: 'ftp', label: 'tool_ftp' },
  { id: 'gobuster', label: 'tool_gobuster' },
  { id: 'burp', label: 'tool_burp' },
  { id: 'redis', label: 'tool_redis' },
  { id: 'openvpn', label: 'tool_openvpn' },
  { id: 'phpshell', label: 'tool_phpshell' },
  { id: 'network', label: 'tool_network' },
  { id: 'sql', label: 'tool_sql' },
  { id: 'john', label: 'tool_john' },
  { id: 'windows', label: 'tool_windows' },
  { id: 'aws', label: 'tool_aws' },
  { id: 'grep', label: 'tool_grep' },
  { id: 'settings', label: 'settings' }
];

export default function ShortcutsPage({ onRefresh }) {
  const { t } = useLanguage();
  const [shortcuts, setShortcuts] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recordingTool, setRecordingTool] = useState(null);

  useEffect(() => {
    fetch('/api/shortcuts')
      .then(res => res.json())
      .then(data => {
        setShortcuts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleKeyDown = (e, toolId) => {
    e.preventDefault();
    if (e.key === 'Escape') {
      setRecordingTool(null);
      return;
    }

    const modifiers = [];
    if (e.ctrlKey) modifiers.push('Ctrl');
    if (e.shiftKey) modifiers.push('Shift');
    if (e.altKey) modifiers.push('Alt');

    const key = e.key.length === 1 ? e.key : (e.key === ' ' ? 'Space' : null);
    
    if (key) {
      const combo = [...modifiers, key].join('+');
      setShortcuts(prev => ({ ...prev, [toolId]: combo }));
      setRecordingTool(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/shortcuts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shortcuts)
      });
      if (res.ok && onRefresh) onRefresh();
    } catch (e) {}
    setSaving(false);
  };

  const handleClear = (toolId) => {
    setShortcuts(prev => {
      const newS = { ...prev };
      delete newS[toolId];
      return newS;
    });
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 100 }}><Loader2 className="spin" /></div>;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <div className="page-title"><Keyboard size={24} /> <span>{t('shortcuts_title') || 'Klavye Kısayolları'}</span></div>
          <div className="page-subtitle">{t('shortcuts_desc') || 'Araçlar arası hızlı geçiş için özel tuş atamaları tanımlayın.'}</div>
        </div>
        <button className="btn btn-cyan" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
          <span>{t('save') || 'Kaydet'}</span>
        </button>
      </div>

      <div className="grid-2">
        <div className="info-panel glass-card" style={{ padding: 20 }}>
          <SectionTitle icon={<Keyboard size={18} />}>{t('tool_shortcuts') || 'Araç Kısayolları'}</SectionTitle>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {TOOLS.map(tool => (
              <div key={tool.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '12px 16px',
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                borderRadius: 12
              }}>
                <div style={{ fontWeight: 500 }}>{t(tool.label)}</div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {recordingTool === tool.id ? (
                    <div 
                      onKeyDown={(e) => handleKeyDown(e, tool.id)}
                      tabIndex={0}
                      autoFocus
                      style={{
                        padding: '6px 12px',
                        background: 'var(--accent-cyan)',
                        color: 'black',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        animation: 'pulse 1s infinite'
                      }}
                    >
                      Tuş Bekleniyor... (Esc: İptal)
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <code style={{ 
                        background: 'rgba(0,0,0,0.3)', 
                        padding: '4px 8px', 
                        borderRadius: 4, 
                        color: 'var(--accent-cyan)',
                        minWidth: 60,
                        textAlign: 'center'
                      }}>
                        {shortcuts[tool.id] || '---'}
                      </code>
                      <button 
                        onClick={() => setRecordingTool(tool.id)}
                        className="btn-icon" 
                        style={{ padding: 4, height: 'auto' }}
                        title="Değiştir"
                      >
                        <Keyboard size={14} />
                      </button>
                      {shortcuts[tool.id] && (
                        <button 
                          onClick={() => handleClear(tool.id)}
                          className="btn-icon" 
                          style={{ padding: 4, height: 'auto', color: 'var(--accent-red)' }}
                          title="Sil"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <InfoCard title={t('shortcut_tips_title') || 'İpuçları'} icon={<Info size={18} />} color="cyan">
            <div className="cmd-desc" style={{ fontSize: 13 }}>
              - Kısayollar globaldir, her sayfada çalışır.<br/><br/>
              - Yazı yazarken (Input alanlarında) çalışmazlar.<br/><br/>
              - <b>Ctrl + N</b>, <b>Ctrl + Shift + S</b> gibi kombinasyonlar önerilir.<br/><br/>
              - ESC tuşuna basarak tuş kaydını iptal edebilirsiniz.
            </div>
          </InfoCard>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.6; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

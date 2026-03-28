import { useLanguage } from '../context/LanguageContext';
import { 
  Terminal, 
  Search, 
  FolderTree, 
  Database, 
  Shield, 
  Cpu, 
  Code,
  Network,
  Lock,
  Globe,
  FileType,
  Cloud,
  Layers,
  Settings
} from 'lucide-react';

const TOOLS = [
  { id: 'terminal', icon: <Terminal />, color: 'cyan', label: 'terminal', desc: 'c_terminal' },
  { id: 'nmap', icon: <Search />, color: 'green', label: 'nmap', desc: 'c_nmap' },
  { id: 'ftp', icon: <FolderTree />, color: 'purple', label: 'ftp', desc: 'c_ftp' },
  { id: 'redis', icon: <Database />, color: 'orange', label: 'redis', desc: 'c_redis' },
  { id: 'openvpn', icon: <Shield />, color: 'red', label: 'openvpn', desc: 'c_openvpn' },
  { id: 'burp', icon: <Cpu />, color: 'yellow', label: 'burp', desc: 'c_burp' },
  { id: 'phpshell', icon: <Code />, color: 'cyan', label: 'phpshell', desc: 'c_phpshell' },
  { id: 'network', icon: <Network />, color: 'green', label: 'network', desc: 'c_network' },
  { id: 'sql', icon: <Lock />, color: 'purple', label: 'sql', desc: 'c_sql' },
  { id: 'gobuster', icon: <Globe />, color: 'orange', label: 'gobuster', desc: 'c_gobuster' },
  { id: 'john', icon: <FileType />, color: 'red', label: 'john', desc: 'c_john' },
  { id: 'aws', icon: <Cloud />, color: 'yellow', label: 'aws', desc: 'c_aws' },
  { id: 'grep', icon: <Layers />, color: 'cyan', label: 'grep', desc: 'c_grep' },
  { id: 'settings', icon: <Settings />, color: 'gray', label: 'settings', desc: 'c_settings' }
];

export default function HomePage({ onNavigate }) {
  const { t } = useLanguage();

  return (
    <div style={{ paddingBottom: 40 }}>
      <div className="page-header" style={{ border: 'none', marginBottom: 40 }}>
        <div style={{ textAlign: 'center', width: '100%' }}>
          <h1 style={{ fontSize: 32, marginBottom: 12 }}>⬡ HackTerm <span style={{ color: 'var(--accent-cyan)' }}>Pro Lab</span></h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>{t('welcome_desc') || 'Profesyonel sızma testi ve güvenlik geliştirme istasyonuna hoş geldiniz.'}</p>
        </div>
      </div>

      <div className="notes-grid">
        {TOOLS.map((tool) => (
          <div 
            key={tool.id} 
            className="note-card glass-card" 
            onClick={() => onNavigate(tool.id)}
            style={{ 
              cursor: 'pointer', 
              minHeight: 180,
              borderLeft: `4px solid var(--accent-${tool.color})`
            }}
          >
            <div>
              <div style={{ 
                width: 44, height: 44, 
                borderRadius: 12, 
                background: `rgba(var(--accent-${tool.color}-rgb), 0.1)`,
                color: `var(--accent-${tool.color})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16
              }}>
                {tool.icon}
              </div>
              <h3 style={{ fontSize: 16, marginBottom: 8, color: 'var(--text-primary)' }}>{t(tool.label)}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {t(tool.desc)}
              </p>
            </div>
            <div style={{ marginTop: 16, fontSize: 11, fontWeight: 600, color: `var(--accent-${tool.color})`, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {t('launch_tool') || 'BAŞLAT'} →
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

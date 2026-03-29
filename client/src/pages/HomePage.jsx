import { useJobs } from '../context/JobContext';
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
  Settings,
  Monitor,
  Pin,
  PinOff
} from 'lucide-react';

const TOOLS = [
  { id: 'terminal', icon: <Terminal />, color: 'cyan', label: 'tool_terminal', desc: 'c_terminal' },
  { id: 'nmap', icon: <Search />, color: 'green', label: 'tool_nmap', desc: 'c_nmap' },
  { id: 'ftp', icon: <FolderTree />, color: 'purple', label: 'tool_ftp', desc: 'c_ftp' },
  { id: 'gobuster', icon: <Globe />, color: 'orange', label: 'tool_gobuster', desc: 'c_gobuster' },
  { id: 'burp', icon: <Cpu />, color: 'yellow', label: 'tool_burp', desc: 'c_burp' },
  { id: 'redis', icon: <Database />, color: 'orange', label: 'tool_redis', desc: 'c_redis' },
  { id: 'openvpn', icon: <Shield />, color: 'red', label: 'tool_openvpn', desc: 'c_openvpn' },
  { id: 'phpshell', icon: <Code />, color: 'cyan', label: 'tool_phpshell', desc: 'c_phpshell' },
  { id: 'network', icon: <Network />, color: 'green', label: 'tool_network', desc: 'c_network' },
  { id: 'sql', icon: <Lock />, color: 'purple', label: 'tool_sql', desc: 'c_sql' },
  { id: 'john', icon: <FileType />, color: 'red', label: 'tool_john', desc: 'c_john' },
  { id: 'windows', icon: <Monitor />, color: 'orange', label: 'tool_windows', desc: 'c_windows' },
  { id: 'aws', icon: <Cloud />, color: 'yellow', label: 'tool_aws', desc: 'c_aws' },
  { id: 'grep', icon: <Layers />, color: 'cyan', label: 'tool_grep', desc: 'c_grep' },
];

export default function HomePage({ onNavigate }) {
  const { t } = useLanguage();
  const { pinnedTools, togglePinTool } = useJobs();

  return (
    <div style={{ paddingBottom: 40 }}>
      <div className="page-header" style={{ border: 'none', marginBottom: 40 }}>
        <div style={{ textAlign: 'center', width: '100%' }}>
          <h1 style={{ fontSize: 32, marginBottom: 12 }}>⬡ HackTerm <span style={{ color: 'var(--accent-cyan)' }}>Pro Lab</span></h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>{t('welcome_desc') || 'Profesyonel sızma testi ve güvenlik geliştirme istasyonuna hoş geldiniz.'}</p>
        </div>
      </div>

      <div className="notes-grid">
        {TOOLS.map((tool) => {
          const isPinned = pinnedTools.includes(tool.id);
          return (
            <div 
              key={tool.id} 
              className="note-card glass-card" 
              onClick={() => onNavigate(tool.id)}
              style={{ 
                cursor: 'pointer', 
                minHeight: 180,
                borderLeft: `4px solid var(--accent-${tool.color})`,
                position: 'relative'
              }}
            >
              <button 
                onClick={(e) => { e.stopPropagation(); togglePinTool(tool.id); }}
                style={{ 
                  position: 'absolute', top: 12, right: 12, 
                  background: 'none', border: 'none', cursor: 'pointer', 
                  color: isPinned ? `var(--accent-${tool.color})` : 'var(--text-muted)',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                title={isPinned ? t('unpin_from_sidebar') : t('pin_to_sidebar')}
              >
                {isPinned ? <Pin size={16} fill="currentColor" /> : <Pin size={16} />}
              </button>

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
          );
        })}
      </div>
    </div>
  );
}

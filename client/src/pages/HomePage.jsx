import { useJobs } from '../context/JobContext';
import { useSocket } from '../context/SocketContext';
import { useLanguage } from '../context/LanguageContext';

const TOOL_CARDS = [
  { id: 'terminal', icon: '⬡', title: 'Terminal', desc: 'c_term_desc', color: 'green', tags: ['PTY', 'Ubuntu', 'Docker'] },
  { id: 'ftp', icon: '📁', title: 'FTP', desc: 'c_ftp_desc', color: 'cyan', tags: ['FTP', 'mget', 'AnonymousLogin'] },
  { id: 'nmap', icon: '🔍', title: 'Nmap', desc: 'c_nmap_desc', color: 'green', tags: ['Port Scan', 'Service', 'NSE'] },
  { id: 'windows', icon: '🪟', title: 'Windows', desc: 'c_windows_desc', color: 'orange', tags: ['SMB', 'WinRM', 'MSSQL'] },
  { id: 'redis', icon: '🗄', title: 'Redis', desc: 'c_redis_desc', color: 'red', tags: ['redis-cli', 'KEYS', 'CONFIG'] },
  { id: 'gobuster', icon: '🌐', title: 'Gobuster', desc: 'c_gobuster_desc', color: 'purple', tags: ['dir', 'dns', 'wordlist'] },
  { id: 'sql', icon: '💉', title: 'SQL', desc: 'c_sql_desc', color: 'yellow', tags: ['MySQL', 'MariaDB', 'SQLi'] },
  { id: 'phpshell', icon: '🐚', title: 'PHP Shell', desc: 'c_phpshell_desc', color: 'red', tags: ['NC', 'bash', 'python3', 'pty'] },
  { id: 'network', icon: '🔒', title: 'Ağ Güvenliği', desc: 'c_network_desc', color: 'purple', tags: ['NC', 'Responder', 'NTLMv2'] },
  { id: 'john', icon: '🔑', title: 'John & Hashcat', desc: 'c_john_desc', color: 'yellow', tags: ['John', 'Hashcat', 'rockyou'] },
  { id: 'aws', icon: '☁', title: 'AWS', desc: 'c_aws_desc', color: 'cyan', tags: ['S3', 'aws-cli', 'endpoint'] },
  { id: 'openvpn', icon: '🛡️', title: 'OpenVPN', desc: 'c_openvpn_desc', color: 'purple', tags: ['VPN', '.ovpn', 'tun0'] },
  { id: 'burp', icon: '🐝', title: 'Burp Suite', desc: 'c_burp_desc', color: 'orange', tags: ['Proxy', 'GUI', 'noVNC'] },
  { id: 'grep', icon: '🔎', title: 'Grep', desc: 'c_grep_desc', color: 'green', tags: ['-r', '-i', '-E', 'regex'] },
];

const COLOR_MAP = {
  green:  'green',
  purple: 'purple',
  orange: 'orange',
  cyan:   'cyan',
  red:    'red',
  yellow: 'yellow',
};

export default function HomePage({ onNavigate }) {
  const { activeJob } = useJobs();
  const { connected } = useSocket();
  const { t } = useLanguage();

  return (
    <div>
      {/* Hero */}
      <div style={{ marginBottom: 28, padding: '24px 0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            fontFamily: 'JetBrains Mono', fontSize: 28, fontWeight: 800,
            background: 'linear-gradient(135deg, var(--accent-green), var(--accent-cyan))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em'
          }}>
            HackTool Basic
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 11,
            fontFamily: 'JetBrains Mono', color: connected ? 'var(--accent-green)' : 'var(--text-muted)',
            background: connected ? 'rgba(0,255,136,0.07)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${connected ? 'rgba(0,255,136,0.25)' : 'var(--border)'}`,
            borderRadius: 20, padding: '3px 10px'
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: connected ? 'var(--accent-green)' : 'var(--text-muted)', display: 'inline-block' }} />
            {connected ? t('connected') : t('connecting')}
          </div>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          {t('subtitle')}
          {activeJob ? (
            <span style={{ color: 'var(--accent-green)', marginLeft: 8 }}>
              {t('active_jobs')}: <b>{activeJob.name}</b> {activeJob.ip && `→ ${activeJob.ip}`}
            </span>
          ) : (
            <span style={{ color: 'var(--accent-orange)', marginLeft: 8 }}>
              {t('no_active_jobs')}
            </span>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="cards-grid">
        {TOOL_CARDS.map(card => (
          <div
            key={card.id}
            className={`tool-card ${card.color === 'green' ? 'green-accent' : ''}`}
            onClick={() => onNavigate(card.id)}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100) + '%');
              e.currentTarget.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100) + '%');
            }}
          >
            <div className={`card-icon-wrap ${COLOR_MAP[card.color] || 'green'}`}>{card.icon}</div>
            <div className="card-title">{card.title}</div>
            <div className="card-desc">{t(card.desc)}</div>
            <div className="card-tags">
              {card.tags.map(t => (
                <span key={t} className={`tag ${COLOR_MAP[card.color] || 'gray'}`}>{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

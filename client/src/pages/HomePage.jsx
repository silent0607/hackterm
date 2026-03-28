import { useJobs } from '../context/JobContext';
import { useSocket } from '../context/SocketContext';

const TOOL_CARDS = [
  { id: 'terminal', icon: '⬡', title: 'Terminal', desc: 'Yerel veya uzak (SSH/Docker) terminaller aç, yönet', color: 'green', tags: ['PTY', 'SSH', 'Docker'] },
  { id: 'ftp', icon: '📁', title: 'FTP', desc: 'FTP sunucusuna bağlan, dosya indir/yükle', color: 'cyan', tags: ['FTP', 'mget', 'AnonymousLogin'] },
  { id: 'nmap', icon: '🔍', title: 'Nmap', desc: 'Hızlı port tarama ve servis/versiyon tespiti', color: 'green', tags: ['Port Scan', 'Service', 'NSE'] },
  { id: 'windows', icon: '🪟', title: 'Windows', desc: 'SMBclient, Evil-WinRM ve MSSQL araçları', color: 'orange', tags: ['SMB', 'WinRM', 'MSSQL'] },
  { id: 'redis', icon: '🗄', title: 'Redis', desc: 'Redis CLI ile veritabanına bağlan ve keşfet', color: 'red', tags: ['redis-cli', 'KEYS', 'CONFIG'] },
  { id: 'gobuster', icon: '🌐', title: 'Gobuster', desc: 'Web dizin ve alt domain keşfi (brute force)', color: 'purple', tags: ['dir', 'dns', 'wordlist'] },
  { id: 'sql', icon: '💉', title: 'SQL', desc: 'MySQL/MariaDB bağlantısı ve SQL Injection referansı', color: 'yellow', tags: ['MySQL', 'MariaDB', 'SQLi'] },
  { id: 'phpshell', icon: '🐚', title: 'PHP Shell', desc: 'Reverse shell yöntemleri ve web shell oluşturma', color: 'red', tags: ['NC', 'bash', 'python3', 'pty'] },
  { id: 'network', icon: '🔒', title: 'Ağ Güvenliği', desc: 'Netcat dinleyici ve Responder LLMNR/NBT-NS zehirleme', color: 'purple', tags: ['NC', 'Responder', 'NTLMv2'] },
  { id: 'john', icon: '🔑', title: 'John & Hashcat', desc: 'Parola hash kırma araçları', color: 'yellow', tags: ['John', 'Hashcat', 'rockyou'] },
  { id: 'aws', icon: '☁', title: 'AWS', desc: 'AWS CLI ve S3 bucket keşfi, shell yükleme', color: 'cyan', tags: ['S3', 'aws-cli', 'endpoint'] },
  { id: 'grep', icon: '🔎', title: 'Grep', desc: '-r, -i, -E gibi bayraklar ve sızma testi kullanımları', color: 'green', tags: ['-r', '-i', '-E', 'regex'] },
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
            {connected ? 'Sunucu Bağlı' : 'Bağlanıyor...'}
          </div>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          Sızma testi araçlarını tek arayüzden kullan.
          {activeJob ? (
            <span style={{ color: 'var(--accent-green)', marginLeft: 8 }}>
              Aktif iş: <b>{activeJob.name}</b> {activeJob.ip && `→ ${activeJob.ip}`}
            </span>
          ) : (
            <span style={{ color: 'var(--accent-orange)', marginLeft: 8 }}>
              Sol menüden bir iş oluşturup IP gir.
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
            <div className="card-desc">{card.desc}</div>
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

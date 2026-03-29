import { useState } from 'react';
import { useJobs } from '../context/JobContext';
import { useSocket } from '../context/SocketContext';
import { InfoCard, CmdLine, SectionTitle } from '../components/InfoCard';
import { sendCmd } from '../utils/helpers';
import Terminal from '../components/Terminal';

const WINDOWS_CARDS = [
  { id: 'smb', label: 'SMBclient', icon: '🗂', desc: 'Windows SMB paylaşımlarına eriş, dosya listele ve indir' },
  { id: 'winrm', label: 'Evil-WinRM', icon: '💀', desc: 'Windows Remote Management üzerinden shell al' },
  { id: 'mssql', label: 'MSSQL Client', icon: '🗃', desc: 'impacket-mssqlclient ile MSSQL veritabanına bağlan' },
];

function SmbSection({ ip, socket, jobId }) {
  const termId = `smb-${jobId || 'default'}`;
  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <button className="btn-pro btn-green" onClick={() => sendCmd(socket, termId, `smbclient -L //${ip}`)}>
          🔗 Normal Bağlan
        </button>
        <button className="btn-pro btn-cyan" onClick={() => sendCmd(socket, termId, `smbclient -L //${ip} -N`)}>
          👤 Anonim Bağlan
        </button>
      </div>
      <Terminal id={termId} title="SMBclient Terminal" height={260} />
      <SectionTitle icon="📋">SMBclient Komutları</SectionTitle>
      <InfoCard title="Bağlantı & Listeleme" icon="🗂" defaultOpen color="green">
        <CmdLine cmd={`smbclient -L //${ip} -N`} desc="Anonim bağlantı – paylaşımları listele" termId={termId} />
        <CmdLine cmd={`smbclient //${ip}/<paylasim>`} desc="Belirli bir paylaşıma bağlan" termId={termId} />
        <CmdLine cmd={`smbclient //${ip}/<paylasim> -U <kullanici>`} desc="Kullanıcı adıyla bağlan" termId={termId} />
        <CmdLine cmd="ls" desc="Paylaşımdaki dosyaları listele" termId={termId} />
        <CmdLine cmd="get <dosya>" desc="Dosya indir" termId={termId} />
        <CmdLine cmd="mget *" desc="Tüm dosyaları indir" termId={termId} />
        <CmdLine cmd="put <dosya>" desc="Dosya yükle" termId={termId} />
      </InfoCard>
    </div>
  );
}

function WinrmSection({ ip, socket, jobId }) {
  const termId = `winrm-${jobId || 'default'}`;
  const [user, setUser] = useState('Administrator');
  const [pass, setPass] = useState('');
  const connect = () => sendCmd(socket, termId, `evil-winrm -i ${ip} -u ${user} -p '${pass}'`);
  const connectHash = () => sendCmd(socket, termId, `evil-winrm -i ${ip} -u ${user} -H <NTLM_HASH>`);
  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ flex: 1, minWidth: 120 }}>
          <label className="form-label">Kullanıcı</label>
          <input className="form-input" value={user} onChange={e => setUser(e.target.value)} />
        </div>
        <div className="form-group" style={{ flex: 1, minWidth: 120 }}>
          <label className="form-label">Parola</label>
          <input className="form-input" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="parola" />
        </div>
        <button className="btn-pro btn-green" onClick={connect}>💀 Bağlan</button>
        <button className="btn-pro btn-orange" onClick={connectHash}>🔐 Hash ile Bağlan</button>
      </div>
      <Terminal id={termId} title="Evil-WinRM Terminal" height={260} />
      <SectionTitle icon="📋">Evil-WinRM Komutları</SectionTitle>
      <InfoCard title="Temel Kullanım & Bayraklar" icon="💀" defaultOpen color="orange">
        <CmdLine cmd={`evil-winrm -i ${ip} -u <kullanici> -p <parola>`} desc="Parola ile bağlan" termId={termId} />
        <CmdLine cmd={`evil-winrm -i ${ip} -u <kullanici> -H <NTLM_HASH>`} desc="NTLM hash ile bağlan" termId={termId} />
        <div style={{ height: 8 }} />
        <div className="cmd-desc"><b>Windows'ta temel komutlar:</b></div>
        <CmdLine cmd="whoami" desc="Mevcut kullanıcıyı göster" termId={termId} />
        <CmdLine cmd="type <dosya>" desc="Dosya içeriği (Linux'taki cat)" termId={termId} />
        <CmdLine cmd="dir" desc="Dizin listele (Linux'taki ls)" termId={termId} />
        <CmdLine cmd="cd Desktop" desc="Masaüstüne git" termId={termId} />
      </InfoCard>
    </div>
  );
}

function MssqlSection({ ip, socket, jobId }) {
  const termId = `mssql-${jobId || 'default'}`;
  const [user, setUser] = useState('sa');
  const [pass, setPass] = useState('');
  const connect = () => sendCmd(socket, termId, `impacket-mssqlclient ${user}:${pass}@${ip}`);
  const connectWin = () => sendCmd(socket, termId, `impacket-mssqlclient ${user}:${pass}@${ip} -windows-auth`);
  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ flex: 1, minWidth: 120 }}>
          <label className="form-label">Kullanıcı</label>
          <input className="form-input" value={user} onChange={e => setUser(e.target.value)} />
        </div>
        <div className="form-group" style={{ flex: 1, minWidth: 120 }}>
          <label className="form-label">Parola</label>
          <input className="form-input" value={pass} onChange={e => setPass(e.target.value)} placeholder="parola" />
        </div>
        <button className="btn-pro btn-purple" onClick={connect}>🗃 Bağlan</button>
        <button className="btn-pro btn-orange" onClick={connectWin}>🪟 Windows Auth</button>
      </div>
      <Terminal id={termId} title="MSSQL Client Terminal" height={260} />
      <SectionTitle icon="📋">MSSQL Komutları</SectionTitle>
      <InfoCard title="xp_cmdshell ile Kod Çalıştırma" icon="⚡" defaultOpen color="orange">
        <div className="alert alert-orange">⚠ xp_cmdshell normalde kapalıdır, önce etkinleştir!</div>
        <CmdLine cmd="EXEC sp_configure 'show advanced options', 1;" desc="Adım 1: Gelişmiş seçenekleri göster" termId={termId} />
        <CmdLine cmd="RECONFIGURE;" desc="Adım 2: Uygula" termId={termId} />
        <CmdLine cmd="EXEC sp_configure 'xp_cmdshell', 1;" desc="Adım 3: xp_cmdshell'i aç" termId={termId} />
        <CmdLine cmd="EXEC xp_cmdshell 'whoami';" desc="Adım 5: Sistem komutu çalıştır!" termId={termId} />
      </InfoCard>
    </div>
  );
}

export default function WindowsPage({ onBack }) {
  const { activeJob, activeJobId, updateJob } = useJobs();
  const { socket } = useSocket();
  const [ip, setIp] = useState(activeJob?.ip || '');
  const [activeCard, setActiveCard] = useState(null);

  if (activeCard) {
    const cardIp = ip || activeJob?.ip || '10.10.10.10';
    return (
      <div style={{ paddingBottom: 40 }}>
        <div className="page-header">
          <div>
            <div className="page-header-back" onClick={() => setActiveCard(null)}>← Windows</div>
            <div className="page-title">🪟 <span>{WINDOWS_CARDS.find(c => c.id === activeCard)?.label}</span></div>
          </div>
        </div>
        <div className="ip-bar" style={{ marginBottom: 16 }}>
          <span className="ip-bar-label">🎯 Hedef IP</span>
          <input className="form-input" value={ip} onChange={e => { setIp(e.target.value); if (activeJob) updateJob(activeJob.id, { ip: e.target.value }); }}
            placeholder={activeJob?.ip || '10.10.10.10'} style={{ height: 38 }} />
        </div>
        {activeCard === 'smb' && <SmbSection ip={cardIp} socket={socket} jobId={activeJobId} />}
        {activeCard === 'winrm' && <WinrmSection ip={cardIp} socket={socket} jobId={activeJobId} />}
        {activeCard === 'mssql' && <MssqlSection ip={cardIp} socket={socket} jobId={activeJobId} />}
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-back" onClick={onBack}>← Ana Menü</div>
          <div className="page-title">🪟 <span>Windows</span></div>
          <div className="page-subtitle">Windows hedeflere yönelik araçlar</div>
        </div>
      </div>
      <div className="ip-bar" style={{ marginBottom: 20 }}>
        <span className="ip-bar-label">🎯 Hedef IP</span>
        <input className="form-input" value={ip} onChange={e => { setIp(e.target.value); if (activeJob) updateJob(activeJob.id, { ip: e.target.value }); }}
          placeholder={activeJob?.ip || '10.10.10.10'} style={{ height: 38 }} />
      </div>
      <div className="notes-grid">
        {WINDOWS_CARDS.map(card => {
          const accentColor = card.id === 'smb' ? 'green' : card.id === 'winrm' ? 'orange' : 'purple';
          return (
            <div 
              key={card.id} 
              className="note-card glass-card" 
              onClick={() => setActiveCard(card.id)}
              style={{ borderLeft: `4px solid var(--accent-${accentColor})`, minHeight: 180 }}
            >
              <div>
                <div style={{ 
                  width: 44, height: 44, 
                  borderRadius: 12, 
                  background: `rgba(var(--accent-${accentColor}-rgb), 0.1)`,
                  color: `var(--accent-${accentColor})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                  fontSize: 20
                }}>
                  {card.icon}
                </div>
                <h3 style={{ fontSize: 16, marginBottom: 8, color: 'var(--text-primary)' }}>{card.label}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {card.desc}
                </p>
              </div>
              <div style={{ marginTop: 16, fontSize: 11, fontWeight: 600, color: `var(--accent-${accentColor})`, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                AÇ →
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

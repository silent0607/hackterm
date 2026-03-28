import { useRef, useState } from 'react';
import { useJobs } from '../context/JobContext';
import { useSocket } from '../context/SocketContext';
import { useTerminal } from '../hooks/useTerminal';
import { InfoCard, CmdLine, SectionTitle } from '../components/InfoCard';
import { sendCmd } from '../utils/helpers';

const smbTermId = 'smb-main';
const winrmTermId = 'winrm-main';
const mssqlTermId = 'mssql-main';

function ToolTerminal({ id, label }) {
  const containerRef = useRef(null);
  const { isReady } = useTerminal(id, containerRef);
  return (
    <div className="terminal-container" style={{ height: 260 }}>
      <div className="terminal-titlebar">
        <div className="terminal-dots">
          <div className="terminal-dot red" /><div className="terminal-dot yellow" /><div className="terminal-dot green" />
        </div>
        <div className="terminal-title">
          {isReady ? <span style={{ color: 'var(--accent-green)' }}>● {label}</span> : <span style={{ color: 'var(--text-muted)' }}>○ bağlanıyor...</span>}
        </div>
      </div>
      <div ref={containerRef} style={{ height: 222, padding: '4px 2px' }} />
    </div>
  );
}

const WINDOWS_CARDS = [
  { id: 'smb', label: 'SMBclient', icon: '🗂', desc: 'Windows SMB paylaşımlarına eriş, dosya listele ve indir' },
  { id: 'winrm', label: 'Evil-WinRM', icon: '💀', desc: 'Windows Remote Management üzerinden shell al' },
  { id: 'mssql', label: 'MSSQL Client', icon: '🗃', desc: 'impacket-mssqlclient ile MSSQL veritabanına bağlan' },
];

function SmbSection({ ip, socket }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <button className="btn btn-green" onClick={() => sendCmd(socket, smbTermId, `smbclient -L //${ip}`)}>
          🔗 Normal Bağlan
        </button>
        <button className="btn btn-cyan" onClick={() => sendCmd(socket, smbTermId, `smbclient -L //${ip} -N`)}>
          👤 Anonim Bağlan
        </button>
      </div>
      <ToolTerminal id={smbTermId} label="smbclient" />
      <SectionTitle icon="📋">SMBclient Komutları</SectionTitle>
      <InfoCard title="Bağlantı & Listeleme" icon="🗂" defaultOpen color="green">
        <CmdLine cmd={`smbclient -L //${ip} -N`} desc="Anonim bağlantı – paylaşımları listele (-N = şifre yok)" termId={smbTermId} />
        <CmdLine cmd={`smbclient //${ip}/<paylasim>`} desc="Belirli bir paylaşıma bağlan" termId={smbTermId} />
        <CmdLine cmd={`smbclient //${ip}/<paylasim> -U <kullanici>`} desc="Kullanıcı adıyla bağlan" termId={smbTermId} />
        <CmdLine cmd="ls" desc="Paylaşımdaki dosyaları listele" termId={smbTermId} />
        <CmdLine cmd="get <dosya>" desc="Dosya indir" termId={smbTermId} />
        <CmdLine cmd="mget *" desc="Tüm dosyaları indir" termId={smbTermId} />
        <CmdLine cmd="put <dosya>" desc="Dosya yükle" termId={smbTermId} />
      </InfoCard>
      <InfoCard title="Bilgi Kartı: SMBclient ne ise yarar?" icon="ℹ" color="purple">
        <div className="cmd-desc">
          SMBclient, Windows paylaşım protokolü (SMB/CIFS) üzerinden dosya sunucularına bağlanmanı sağlar.
          Sızma testlerinde: parola gerektirmeyen paylaşımları bul, hassas dosyaları indir.
          <br /><br />
          <b>-L</b>: Paylaşımları listele &nbsp;|&nbsp; <b>-N</b>: Şifresiz (anonim) &nbsp;|&nbsp; <b>-U</b>: Kullanıcı belirt<br />
          <b>mget *</b> ile toplu indirme için önce <code>prompt off</code> yaz.
        </div>
      </InfoCard>
    </div>
  );
}

function WinrmSection({ ip, socket }) {
  const [user, setUser] = useState('Administrator');
  const [pass, setPass] = useState('');
  const connect = () => sendCmd(socket, winrmTermId, `evil-winrm -i ${ip} -u ${user} -p '${pass}'`);
  const connectHash = () => sendCmd(socket, winrmTermId, `evil-winrm -i ${ip} -u ${user} -H <NTLM_HASH>`);
  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ flex: 1, minWidth: 120 }}>
          <label className="form-label">Kullanıcı</label>
          <input className="form-input" value={user} onChange={e => setUser(e.target.value)} />
        </div>
        <div className="form-group" style={{ flex: 1, minWidth: 120 }}>
          <label className="form-label">Parola</label>
          <input className="form-input" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="parola" />
        </div>
        <button className="btn btn-green" onClick={connect}>💀 Bağlan</button>
        <button className="btn btn-orange" onClick={connectHash}>🔐 Hash ile Bağlan</button>
      </div>
      <ToolTerminal id={winrmTermId} label="evil-winrm" />
      <SectionTitle icon="📋">Evil-WinRM Komutları</SectionTitle>
      <InfoCard title="Temel Kullanım & Bayraklar" icon="💀" defaultOpen color="orange">
        <CmdLine cmd={`evil-winrm -i ${ip} -u <kullanici> -p <parola>`} desc="Parola ile bağlan" termId={winrmTermId} />
        <CmdLine cmd={`evil-winrm -i ${ip} -u <kullanici> -H <NTLM_HASH>`} desc="NTLM hash ile bağlan (Pass-the-Hash)" termId={winrmTermId} />
        <div style={{ height: 8 }} />
        <div className="cmd-desc"><b>Windows'ta temel komutlar:</b></div>
        <CmdLine cmd="whoami" desc="Mevcut kullanıcıyı göster" termId={winrmTermId} />
        <CmdLine cmd="type <dosya>" desc="Dosya içeriğini göster (Linux'taki cat)" termId={winrmTermId} />
        <CmdLine cmd="dir" desc="Dizin listele (Linux'taki ls)" termId={winrmTermId} />
        <CmdLine cmd="cd Desktop" desc="Masaüstüne git (bayraklar genelde burada)" termId={winrmTermId} />
        <CmdLine cmd="type user.txt" desc="Kullanıcı bayrağını oku" termId={winrmTermId} />
        <CmdLine cmd="type root.txt" desc="Root bayrağını oku" termId={winrmTermId} />
      </InfoCard>
    </div>
  );
}

function MssqlSection({ ip, socket }) {
  const [user, setUser] = useState('sa');
  const [pass, setPass] = useState('');
  const connect = () => sendCmd(socket, mssqlTermId, `impacket-mssqlclient ${user}:${pass}@${ip}`);
  const connectWin = () => sendCmd(socket, mssqlTermId, `impacket-mssqlclient ${user}:${pass}@${ip} -windows-auth`);
  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ flex: 1, minWidth: 120 }}>
          <label className="form-label">Kullanıcı</label>
          <input className="form-input" value={user} onChange={e => setUser(e.target.value)} />
        </div>
        <div className="form-group" style={{ flex: 1, minWidth: 120 }}>
          <label className="form-label">Parola</label>
          <input className="form-input" value={pass} onChange={e => setPass(e.target.value)} placeholder="parola" />
        </div>
        <button className="btn btn-purple" onClick={connect}>🗃 Bağlan</button>
        <button className="btn btn-orange" onClick={connectWin}>🪟 Windows Auth</button>
      </div>
      <ToolTerminal id={mssqlTermId} label="mssqlclient" />
      <SectionTitle icon="📋">MSSQL Komutları</SectionTitle>
      <InfoCard title="xp_cmdshell ile Kod Çalıştırma" icon="⚡" defaultOpen color="orange">
        <div className="alert alert-orange">⚠ xp_cmdshell normalde kapalıdır, önce etkinleştir!</div>
        <CmdLine cmd="EXEC sp_configure 'show advanced options', 1;" desc="Adım 1: Gelişmiş seçenekleri göster" termId={mssqlTermId} />
        <CmdLine cmd="RECONFIGURE;" desc="Adım 2: Uygula" termId={mssqlTermId} />
        <CmdLine cmd="EXEC sp_configure 'xp_cmdshell', 1;" desc="Adım 3: xp_cmdshell'i aç" termId={mssqlTermId} />
        <CmdLine cmd="RECONFIGURE;" desc="Adım 4: Uygula" termId={mssqlTermId} />
        <CmdLine cmd="EXEC xp_cmdshell 'whoami';" desc="Adım 5: Sistem komutu çalıştır!" termId={mssqlTermId} />
      </InfoCard>
      <InfoCard title="Bilgi Kartı: MSSQL Nedir?" icon="ℹ" color="purple">
        <div className="cmd-desc">
          <b>impacket-mssqlclient</b>: Impacket araç setiyle Microsoft SQL Server'a uzak bağlantı sağlar.<br /><br />
          <b>xp_cmdshell</b>: MSSQL'den işletim sistemi komutu çalıştırmayı sağlayan tehlikeli prosedür.
          Etkinleştirilirse sisteme shell atmak mümkün olur.<br /><br />
          <b>-windows-auth</b>: SQL kimliği yerine Windows kimlik doğrulaması kullan (domain ortamları için).
        </div>
      </InfoCard>
    </div>
  );
}

export default function WindowsPage({ onBack }) {
  const { activeJob, updateJob } = useJobs();
  const { socket } = useSocket();
  const [ip, setIp] = useState(activeJob?.ip || '');
  const [activeCard, setActiveCard] = useState(null);

  if (activeCard) {
    const cardIp = ip || activeJob?.ip || '10.10.10.10';
    return (
      <div>
        <div className="page-header">
          <div>
            <div className="page-header-back" onClick={() => setActiveCard(null)}>← Windows</div>
            <div className="page-title">🪟 <span>{WINDOWS_CARDS.find(c => c.id === activeCard)?.label}</span></div>
          </div>
        </div>
        <div className="ip-bar" style={{ marginBottom: 16 }}>
          <span className="ip-bar-label">🎯 Hedef IP</span>
          <input value={ip} onChange={e => { setIp(e.target.value); if (activeJob) updateJob(activeJob.id, { ip: e.target.value }); }}
            placeholder={activeJob?.ip || '10.10.10.10'} />
        </div>
        {activeCard === 'smb' && <SmbSection ip={cardIp} socket={socket} />}
        {activeCard === 'winrm' && <WinrmSection ip={cardIp} socket={socket} />}
        {activeCard === 'mssql' && <MssqlSection ip={cardIp} socket={socket} />}
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
        <input value={ip} onChange={e => { setIp(e.target.value); if (activeJob) updateJob(activeJob.id, { ip: e.target.value }); }}
          placeholder={activeJob?.ip || '10.10.10.10'} />
      </div>
      <div className="cards-grid">
        {WINDOWS_CARDS.map(card => (
          <div key={card.id} className="tool-card" onClick={() => setActiveCard(card.id)}>
            <div className="card-icon-wrap orange" style={{ fontSize: 24 }}>{card.icon}</div>
            <div className="card-title">{card.label}</div>
            <div className="card-desc">{card.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

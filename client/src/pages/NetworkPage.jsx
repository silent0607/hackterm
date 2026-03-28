import { useRef, useState } from 'react';
import { useJobs } from '../context/JobContext';
import { useSocket } from '../context/SocketContext';
import { useTerminal } from '../hooks/useTerminal';
import { InfoCard, CmdLine, SectionTitle } from '../components/InfoCard';
import { sendCmd } from '../utils/helpers';
import { useLanguage } from '../context/LanguageContext';

const ncTermId = 'nc-main';
const respTermId = 'resp-main';

function NetTerminal({ id, label }) {
  const containerRef = useRef(null);
  const { isReady } = useTerminal(id, containerRef);
  const { t } = useLanguage();
  return (
    <div className="terminal-container" style={{ height: 230 }}>
      <div className="terminal-titlebar">
        <div className="terminal-dots">
          <div className="terminal-dot red" /><div className="terminal-dot yellow" /><div className="terminal-dot green" />
        </div>
        <div className="terminal-title">
          {isReady ? <span style={{ color: 'var(--accent-green)' }}>● {label}</span> : <span style={{ color: 'var(--text-muted)' }}>○ {t('connecting')}</span>}
        </div>
      </div>
      <div ref={containerRef} style={{ height: 192, padding: '4px 2px' }} />
    </div>
  );
}

export default function NetworkPage({ onBack }) {
  const { t } = useLanguage();
  const { activeJob, updateJob } = useJobs();
  const { socket } = useSocket();
  const [ip, setIp] = useState(activeJob?.ip || '');
  const [port, setPort] = useState('4444');
  const [iface, setIface] = useState('tun0');
  const [tab, setTab] = useState('nc');

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-back" onClick={onBack}>{t('back_to_menu')}</div>
          <div className="page-title">🔒 <span>{t('net_title')}</span></div>
          <div className="page-subtitle">{t('net_desc')}</div>
        </div>
      </div>

      <div className="page-tabs">
        {['nc', 'responder'].map(t_id => (
          <div key={t_id} className={`page-tab ${tab === t_id ? 'active' : ''}`} onClick={() => setTab(t_id)}>
            {t_id === 'nc' ? t('nc_tab') : t('resp_tab')}
          </div>
        ))}
      </div>

      {tab === 'nc' && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group">
              <label className="form-label">{t('listen_port')}</label>
              <input className="form-input" value={port} onChange={e => setPort(e.target.value)} style={{ width: 100 }} />
            </div>
            <button className="btn btn-green" onClick={() => sendCmd(socket, ncTermId, `nc -lnvp ${port}`)}>
              {t('nc_listen_btn') || '👂 L'}
            </button>
            <button className="btn btn-purple" onClick={() => sendCmd(socket, ncTermId, `nc -lnvp ${port} | tee capture.txt`)}>
              {t('nc_listen_save_btn')}
            </button>
          </div>

          <NetTerminal id={ncTermId} label="nc (netcat)" />

          <SectionTitle icon="📋">{t('nc_ref_title')}</SectionTitle>
          <InfoCard title={t('flags_title')} icon="🏳" defaultOpen color="green">
            <div className="cmd-desc" dangerouslySetInnerHTML={{ __html: t('nc_flags_desc') }} />
          </InfoCard>
          <InfoCard title={t('usage_examples')} icon="💡" color="purple">
            <CmdLine cmd={`nc -lnvp ${port}`} desc={t('nc_ex1')} termId={ncTermId} />
            <CmdLine cmd={`nc <ip> ${port}`} desc={t('nc_ex2')} termId={ncTermId} />
            <CmdLine cmd={`nc -lnvp ${port} > dosya.txt`} desc={t('nc_ex3')} termId={ncTermId} />
            <CmdLine cmd={`cat dosya.txt | nc <ip> ${port}`} desc={t('nc_ex4')} termId={ncTermId} />
          </InfoCard>
        </>
      )}

      {tab === 'responder' && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">{t('iface_label')}</label>
              <input className="form-input" value={iface} onChange={e => setIface(e.target.value)} placeholder="tun0, eth0, wlan0..." />
            </div>
            <button className="btn btn-orange" onClick={() => sendCmd(socket, respTermId, `sudo python3 Responder.py -I ${iface} -rdwv`)}>
              {t('resp_start')}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => sendCmd(socket, respTermId, `python3 Responder.py --help`)}>
              {t('help_btn')}
            </button>
          </div>

          <NetTerminal id={respTermId} label="Responder" />

          <SectionTitle icon="📋">{t('resp_ref_title')}</SectionTitle>
          <InfoCard title={t('install_title')} icon="⬇" defaultOpen color="green">
            <CmdLine cmd="sudo apt update && sudo apt install git python3-pip -y" desc={t('resp_install1')} termId={respTermId} />
            <CmdLine cmd="git clone https://github.com/lgandx/Responder.git" desc={t('resp_install2')} termId={respTermId} />
            <CmdLine cmd="cd Responder" desc={t('resp_install3')} termId={respTermId} />
          </InfoCard>
          <InfoCard title={t('flags_title')} icon="🏳" color="orange">
            <div className="cmd-desc" dangerouslySetInnerHTML={{ __html: t('resp_flags_desc') }} />
          </InfoCard>
          <InfoCard title={t('resp_what_title')} icon="ℹ" color="purple">
            <div className="cmd-desc" dangerouslySetInnerHTML={{ __html: t('resp_what_desc') }} />
          </InfoCard>
        </>
      )}
    </div>
  );
}

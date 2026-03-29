import { useState } from 'react';
import { useJobs } from '../context/JobContext';
import { useSocket } from '../context/SocketContext';
import { InfoCard, CmdLine, SectionTitle } from '../components/InfoCard';
import { sendCmd } from '../utils/helpers';
import { useLanguage } from '../context/LanguageContext';
import Terminal from '../components/Terminal';

const WORDLISTS = [
  '/usr/share/wordlists/dirb/common.txt',
  '/usr/share/wordlists/dirb/big.txt',
  '/usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt',
  '/usr/share/wordlists/rockyou.txt',
  '/usr/share/seclists/Discovery/Web-Content/common.txt',
  '/usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt',
  '/usr/share/seclists/Discovery/Web-Content/raft-medium-files.txt',
  '/usr/share/seclists/Discovery/Web-Content/api/api-endpoints.txt',
];

export default function GobusterPage({ onBack }) {
  const { activeJob, activeJobId, updateJob } = useJobs();
  const { t } = useLanguage();
  const { socket } = useSocket();
  const [ip, setIp] = useState(activeJob?.ip || '');
  const [wordlist, setWordlist] = useState('/usr/share/wordlists/dirb/common.txt');
  const [customWl, setCustomWl] = useState('');
  const [ext, setExt] = useState('php,html,txt,bak');
  const [threads, setThreads] = useState('50');

  const termId = `gobuster-${activeJobId || 'default'}`;

  const getUrl = () => {
      let target = ip || activeJob?.ip || '10.10.10.10';
      if (!target.startsWith('http')) target = 'http://' + target;
      return target;
  };
  const getWl = () => customWl || wordlist;

  const runDir = () => {
    const target = ip || activeJob?.ip || '';
    if (activeJob && target) updateJob(activeJob.id, { ip: target });
    const extFlag = ext ? ` -x ${ext}` : '';
    sendCmd(socket, termId, `gobuster dir -u ${getUrl()} -w ${getWl()}${extFlag} -t ${threads}`);
  };

  const runDns = () => {
    const target = ip || activeJob?.ip || '';
    sendCmd(socket, termId, `gobuster dns -d ${target} -w ${getWl()} -t ${threads}`);
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      <div className="page-header">
        <div>
          <div className="page-header-back" onClick={onBack}>← {t('back_to_menu')}</div>
          <h1 className="page-title">🚀 <span>Gobuster</span></h1>
          <p className="page-subtitle">{t('gobuster_desc')}</p>
        </div>
      </div>

      <div className="ip-bar">
        <span className="ip-bar-label">🎯 {t('target_ip_label')}</span>
        <input className="form-input" value={ip} onChange={e => { setIp(e.target.value); if (activeJob) updateJob(activeJob.id, { ip: e.target.value }); }}
          placeholder={activeJob?.ip || '10.10.10.10'} style={{ height: 38 }} />
      </div>

      <div className="notes-grid" style={{ marginBottom: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="form-group">
          <label className="form-label">Wordlist Seç</label>
          <select className="form-select" value={wordlist} onChange={e => setWordlist(e.target.value)}>
            {WORDLISTS.map(w => <option key={w} value={w}>{w.split('/').pop()}</option>)}
            <option value="custom">Özel Yol...</option>
          </select>
        </div>
        {wordlist === 'custom' && (
            <div className="form-group">
                <label className="form-label">Özel Wordlist Yolu</label>
                <input className="form-input" value={customWl} onChange={e => setCustomWl(e.target.value)} placeholder="/path/to/list.txt" />
            </div>
        )}
        <div className="form-group">
          <label className="form-label">Uzantılar (-x)</label>
          <input className="form-input" value={ext} onChange={e => setExt(e.target.value)} placeholder="php,html,txt" />
        </div>
        <div className="form-group">
          <label className="form-label">Thread Sayısı (-t)</label>
          <input className="form-input" value={threads} onChange={e => setThreads(e.target.value)} placeholder="50" />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <button className="btn-pro btn-cyan" onClick={runDir}>📁 DIR Tara</button>
        <button className="btn-pro btn-purple" onClick={runDns}>🔗 DNS Tara</button>
      </div>

      <Terminal id={termId} title="Gobuster Terminal" height={320} />

      <div style={{ marginTop: 20 }}>
        <SectionTitle icon="📋">Gobuster Referansı</SectionTitle>
        <InfoCard title="Örnek Komutlar" icon="💡" defaultOpen color="green">
          <CmdLine cmd={`gobuster dir -u ${getUrl()} -w ${getWl()} -x php -t 50`} desc="PHP sayfalarını tara" termId={termId} />
          <CmdLine cmd={`gobuster dns -d target.htb -w ${getWl()} -t 50`} desc="Alt domain tarama" termId={termId} />
        </InfoCard>
      </div>
    </div>
  );
}

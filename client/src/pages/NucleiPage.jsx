import { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useJobs } from '../context/JobContext';
import { useLanguage } from '../context/LanguageContext';
import { InfoCard, SectionTitle, CmdLine } from '../components/InfoCard';
import { Scan, ShieldAlert, Terminal as TermIcon, Play, FileText, Search } from 'lucide-react';
import MultiTerminal, { useMultiTerminalId } from '../components/MultiTerminal';

export default function NucleiPage({ onBack }) {
  const { t } = useLanguage();
  const { socket } = useSocket();
  const { activeJobId, jobs } = useJobs();
  const [running, setRunning] = useState(false);
  const termId = useMultiTerminalId('nuclei');

  const currentJob = jobs.find(j => j.id === activeJobId);
  const target = currentJob?.ip || '';

  const handleScan = (type) => {
    if (!target) return alert(t('select_job_error'));
    setRunning(true);
    
    let cmd = '';
    switch (type) {
      case 'default': cmd = `nuclei -u ${target}\n`; break;
      case 'critical': cmd = `nuclei -u ${target} -severity critical,high\n`; break;
      case 'exposed': cmd = `nuclei -u ${target} -tags exposure,config\n`; break;
    }

    if (socket) {
      socket.emit('terminal:create', { id: termId });
      socket.emit(`terminal:input:${termId}`, cmd);
    }
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      <div className="page-header">
        <div>
          <div className="page-header-back" onClick={onBack}>{t('back_to_menu')}</div>
          <div className="page-title"><Scan size={24} style={{ verticalAlign: 'middle', marginRight: 12, color: 'var(--accent-cyan)' }}/> <span>Nuclei</span></div>
          <div className="page-subtitle">Fast and customizable vulnerability scanner based on simple YAML templates.</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div>
          <SectionTitle icon={<Play size={16} />}>Quick Scan Actions</SectionTitle>
          <div className="info-panel" style={{ padding: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button className="btn-pro btn-cyan" onClick={() => handleScan('default')}>
                <Search size={16} /> {t('default_scan') || 'Varsayılan Tarama'}
              </button>
              <button className="btn-pro btn-red" onClick={() => handleScan('critical')}>
                <ShieldAlert size={16} /> {t('critical_only') || 'Sadece Kritik'}
              </button>
            </div>
            <button className="btn-pro btn-outline btn-full" style={{ marginTop: 12 }} onClick={() => handleScan('exposed')}>
              <FileText size={16} /> {t('exposure_scan') || 'Hassas Bilgi Taraması'}
            </button>
          </div>
        </div>

        <InfoCard title="Tool Overview" icon={<ShieldAlert size={16} />} color="cyan">
          <p style={{ fontSize: 13 }}>
            Nuclei is used to send requests across targets based on templates leading to zero-false positives.
            It provides fast scanning on a large number of protocols.
          </p>
          <div style={{ marginTop: 10 }}>
            <CmdLine cmd="nuclei -update-templates" />
          </div>
        </InfoCard>
      </div>

      <MultiTerminal prefix="nuclei" defaultTitle="Nuclei Console" />

      <div style={{ marginTop: 24 }}>
        <SectionTitle icon={<FileText size={16} />}>Common Command Flags</SectionTitle>
        <div className="info-panel" style={{ padding: 0 }}>
          <table className="pro-table">
            <thead>
              <tr>
                <th>Flag</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><code className="code-tag">-u, -target</code></td><td>Target URL/Host to scan</td></tr>
              <tr><td><code className="code-tag">-t, -templates</code></td><td>List of templates to run</td></tr>
              <tr><td><code className="code-tag">-as, -automatic-scan</code></td><td>Automatic scan using Wappalyzer</td></tr>
              <tr><td><code className="code-tag">-severity</code></td><td>Scan based on severity (low, medium, high, critical)</td></tr>
              <tr><td><code className="code-tag">-o, -output</code></td><td>File to write output to</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

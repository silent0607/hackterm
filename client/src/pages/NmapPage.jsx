import { useRef, useState } from 'react';
import { useJobs } from '../context/JobContext';
import { useSocket } from '../context/SocketContext';
import { useTerminal } from '../hooks/useTerminal';
import { InfoCard, CmdLine, SectionTitle } from '../components/InfoCard';
import { sendCmd } from '../utils/helpers';

const termId = 'nmap-main';

function NmapTerminal() {
  const containerRef = useRef(null);
  const { isReady } = useTerminal(termId, containerRef);
  return (
    <div className="terminal-container" style={{ height: 280 }}>
      <div className="terminal-titlebar">
        <div className="terminal-dots">
          <div className="terminal-dot red" /><div className="terminal-dot yellow" /><div className="terminal-dot green" />
        </div>
        <div className="terminal-title">
          {isReady ? <span style={{ color: 'var(--accent-green)' }}>● nmap</span> : <span style={{ color: 'var(--text-muted)' }}>○ bağlanıyor...</span>}
        </div>
      </div>
      <div ref={containerRef} style={{ height: 242, padding: '4px 2px' }} />
    </div>
  );
}

export default function NmapPage({ onBack }) {
  const { activeJob, updateJob } = useJobs();
  const { socket } = useSocket();
  const [ip, setIp] = useState(activeJob?.ip || '');
  const [ports, setPorts] = useState('');

  const quickScan = () => {
    const target = ip || activeJob?.ip || '';
    if (target && activeJob) updateJob(activeJob.id, { ip: target });
    sendCmd(socket, termId, `nmap -p- -sS --min-rate=1000 -T4 ${target}`);
  };

  const versionScan = () => {
    const target = ip || activeJob?.ip || '';
    if (!ports) return alert('Port numaralarını gir!');
    if (target && activeJob) updateJob(activeJob.id, { ip: target });
    sendCmd(socket, termId, `nmap -sV -p ${ports} ${target}`);
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      <div className="page-header">
        <div>
          <div className="page-header-back" onClick={onBack}>← {t('back_to_menu')}</div>
          <h1 className="page-title">🔍 <span>{t('nmap')}</span></h1>
          <p className="page-subtitle">{t('c_nmap')}</p>
        </div>
      </div>

      <div className="ip-bar">
        <span className="ip-bar-label">🎯 {t('target_ip_label')}</span>
        <input className="form-input" value={ip} onChange={e => { setIp(e.target.value); if (activeJob) updateJob(activeJob.id, { ip: e.target.value }); }}
          placeholder={activeJob?.ip || '10.10.10.10'} style={{ height: 38 }} />
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24, alignItems: 'center' }}>
        <button className="btn-pro btn-cyan" onClick={quickScan}>
          ⚡ {t('quick_scan')}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 300, maxWidth: 600 }}>
          <input className="form-input" value={ports} onChange={e => setPorts(e.target.value)}
            placeholder={t('ports_placeholder')} />
          <button className="btn-pro btn-purple" onClick={versionScan} style={{ whiteSpace: 'nowrap' }}>
            📋 {t('get_version_info')}
          </button>
        </div>
      </div>

      <div className="alert alert-green" style={{ marginBottom: 12 }}>
        <span>💡</span>
        <span><b>Hızlı tarama:</b> nmap -p- -sS --min-rate=1000 -T4 — Tüm portları hızlıca tarar</span>
      </div>
      <div className="alert alert-purple" style={{ marginBottom: 16 }}>
        <span>ℹ</span>
        <span><b>Versiyon tarama:</b> Önce hızlı tara, açık portları gir → sadece o portların servis/versiyon bilgisini al</span>
      </div>

      <NmapTerminal />

      <div style={{ marginTop: 20 }}>
        <SectionTitle icon="📋">Nmap Komut Referansı</SectionTitle>
        <InfoCard title="Tarama Türleri" icon="🔍" defaultOpen color="green">
          <CmdLine cmd="nmap -p- -sS --min-rate=1000 -T4 <ip>" desc="-p-: tüm portlar | -sS: SYN tarama | -T4: hızlı | --min-rate=1000: minimum paket hızı" termId={termId} />
          <CmdLine cmd="nmap -sV -p <portlar> <ip>" desc="Belirli portlarda servis/versiyon tespiti" termId={termId} />
          <CmdLine cmd="nmap -A -p <portlar> <ip>" desc="-A: OS tespiti + script tarama + traceroute" termId={termId} />
          <CmdLine cmd="nmap -sU --top-ports 100 <ip>" desc="UDP port tarama (yavaş olabilir)" termId={termId} />
        </InfoCard>
        <InfoCard title="Script Taramaları (NSE)" icon="📜" color="cyan">
          <CmdLine cmd="nmap --script=vuln <ip>" desc="Güvenlik açıklarını tara" termId={termId} />
          <CmdLine cmd="nmap --script=smb-enum-shares <ip>" desc="SMB paylaşımlarını listele" termId={termId} />
          <CmdLine cmd="nmap --script=ftp-anon <ip>" desc="Anonim FTP erişimini kontrol et" termId={termId} />
          <CmdLine cmd="nmap --script=http-title -p 80,443,8080 <ip>" desc="HTTP başlıklarını göster" termId={termId} />
        </InfoCard>
        <InfoCard title="Çıktı Kaydetme" icon="💾" color="purple">
          <CmdLine cmd="nmap -oN sonuc.txt <ip>" desc="Normal formatta kaydet" termId={termId} />
          <CmdLine cmd="nmap -oA tara <ip>" desc="Tüm formatlarda kaydet (normal, XML, grep)" termId={termId} />
        </InfoCard>
      </div>
    </div>
  );
}

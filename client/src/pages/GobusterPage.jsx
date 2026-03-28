import { useRef, useState } from 'react';
import { useJobs } from '../context/JobContext';
import { useSocket } from '../context/SocketContext';
import { useTerminal } from '../hooks/useTerminal';
import { InfoCard, CmdLine, SectionTitle } from '../components/InfoCard';
import { sendCmd } from '../utils/helpers';

const termId = 'gobuster-main';

function GobusterTerminal() {
  const containerRef = useRef(null);
  const { isReady } = useTerminal(termId, containerRef);
  return (
    <div className="terminal-container" style={{ height: 260 }}>
      <div className="terminal-titlebar">
        <div className="terminal-dots">
          <div className="terminal-dot red" /><div className="terminal-dot yellow" /><div className="terminal-dot green" />
        </div>
        <div className="terminal-title">
          {isReady ? <span style={{ color: 'var(--accent-green)' }}>● gobuster</span> : <span style={{ color: 'var(--text-muted)' }}>○ bağlanıyor...</span>}
        </div>
      </div>
      <div ref={containerRef} style={{ height: 222, padding: '4px 2px' }} />
    </div>
  );
}

const WORDLISTS = [
  '/usr/share/wordlists/dirb/common.txt',
  '/usr/share/wordlists/dirb/big.txt',
  '/usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt',
  '/usr/share/wordlists/dirbuster/directory-list-2.3-small.txt',
  '/usr/share/seclists/Discovery/Web-Content/common.txt',
  '/usr/share/seclists/Discovery/Web-Content/raft-medium-files.txt',
  'wordlist.txt (özel)',
];

export default function GobusterPage({ onBack }) {
  const { activeJob, updateJob } = useJobs();
  const { socket } = useSocket();
  const [ip, setIp] = useState(activeJob?.ip || '');
  const [wordlist, setWordlist] = useState('/usr/share/wordlists/dirb/common.txt');
  const [customWl, setCustomWl] = useState('');
  const [ext, setExt] = useState('php,html,txt,bak');
  const [threads, setThreads] = useState('50');
  const [mode, setMode] = useState('dir');
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  const getUrl = () => `http://${ip || activeJob?.ip || '10.10.10.10'}`;
  const getWl = () => customWl || (wordlist === 'wordlist.txt (özel)' ? 'wordlist.txt' : wordlist);

  const runDir = () => {
    const extFlag = ext ? ` -x ${ext}` : '';
    const authFlag = user ? ` -U ${user} -P ${pass}` : '';
    sendCmd(socket, termId, `gobuster dir -u ${getUrl()} -w ${getWl()}${extFlag} -t ${threads}${authFlag}`);
  };

  const runDns = () => sendCmd(socket, termId, `gobuster dns -d ${ip || activeJob?.ip || 'target.htb'} -w ${getWl()} -t ${threads}`);

  const makeWordlist = () => {
    sendCmd(socket, termId, 'echo -e "admin\\nlogin\\nindex\\nportal\\nuploads\\nbackup\\nconfig\\napi\\nshell" > wordlist.txt');
  };

  const insertWl = () => {
    if (customWl) sendCmd(socket, termId, getWl());
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-back" onClick={onBack}>← Ana Menü</div>
          <div className="page-title">🌐 <span>Gobuster</span></div>
          <div className="page-subtitle">Dizin & alt alan adı brute force aracı</div>
        </div>
      </div>

      <div className="ip-bar">
        <span className="ip-bar-label">🎯 Hedef IP</span>
        <input value={ip} onChange={e => { setIp(e.target.value); if (activeJob) updateJob(activeJob.id, { ip: e.target.value }); }}
          placeholder={activeJob?.ip || '10.10.10.10'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        <div className="form-group">
          <label className="form-label">Wordlist Seç</label>
          <select className="form-select" value={wordlist} onChange={e => setWordlist(e.target.value)}>
            {WORDLISTS.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Özel Wordlist Yolu</label>
          <div style={{ display: 'flex', gap: 6 }}>
            <input className="form-input" value={customWl} onChange={e => setCustomWl(e.target.value)} placeholder="/path/to/list.txt" />
            <button className="btn btn-ghost btn-sm" onClick={insertWl} title="Terminale ekle">⌨</button>
          </div>
        </div>
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
        <button className="btn btn-green" onClick={runDir}>🌐 DIR Tara</button>
        <button className="btn btn-purple" onClick={runDns}>🔗 DNS Tara</button>
        <button className="btn btn-ghost btn-sm" onClick={makeWordlist}>📝 Küçük Wordlist Oluştur</button>
      </div>

      <GobusterTerminal />

      <div style={{ marginTop: 20 }}>
        <SectionTitle icon="📋">Gobuster Referansı</SectionTitle>
        <InfoCard title="Flag Açıklamaları" icon="🏳" defaultOpen color="green">
          <div className="cmd-desc">
            <b>dir</b>: Dizin/dosya brute force modu<br />
            <b>dns</b>: Alt alan adı brute force modu<br />
            <b>-u</b>: Hedef URL (http://ip veya http://alan.adı)<br />
            <b>-w</b>: Kullanılacak wordlist dosyası yolu<br />
            <b>-x</b>: Aranacak uzantılar (php,html,txt,bak)<br />
            <b>-t</b>: Thread sayısı – ne kadar çok, o kadar hızlı (50 iyi başlangıç)<br />
            <b>-U / -P</b>: HTTP Auth kullanıcı adı / şifresi<br />
            <b>-o</b>: Sonuçları dosyaya kaydet<br />
            <b>-k</b>: SSL sertifika hatalarını yoksay<br />
            <b>-s</b>: Gösterilecek HTTP durum kodları (varsayılan: 200,204,301,302,307,401,403)<br />
            <b>--exclude-length</b>: Belirli boyutu olan yanıtları filtrele
          </div>
        </InfoCard>
        <InfoCard title="Örnek Komutlar" icon="💡" color="purple">
          <CmdLine cmd={`gobuster dir -u ${getUrl()} -w ${getWl()} -x php -t 50`} desc="PHP sayfalarını tara" termId={termId} />
          <CmdLine cmd={`gobuster dir -u ${getUrl()} -w ${getWl()} -x php,html,txt,bak -t 50 -o sonuc.txt`} desc="Sonuçları kaydet" termId={termId} />
          <CmdLine cmd={`gobuster dns -d target.htb -w ${getWl()} -t 50`} desc="Alt domain tarama" termId={termId} />
        </InfoCard>
        <InfoCard title="Popüler Wordlist'ler" icon="📚" color="cyan">
          <div className="cmd-desc">
            <b>dirb/common.txt</b>: Hızlı tarama için – 4.614 kelime<br />
            <b>dirb/big.txt</b>: Orta boy – 20.469 kelime<br />
            <b>dirbuster/directory-list-2.3-medium.txt</b>: Kapsamlı – 220.560 kelime<br />
            <b>seclists/common.txt</b>: Modern liste, çok kapsamlı<br /><br />
            <b>Wordlist yok mu?</b> Yukarıdaki "Küçük Wordlist Oluştur" butonu ile başla.
          </div>
        </InfoCard>
      </div>
    </div>
  );
}

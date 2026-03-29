import { useState } from 'react';
import { useJobs } from '../context/JobContext';
import { useSocket } from '../context/SocketContext';
import { InfoCard, CmdLine, SectionTitle } from '../components/InfoCard';
import { sendCmd } from '../utils/helpers';
import Terminal from '../components/Terminal';
import FilePicker from '../components/FilePicker';

const HASH_TYPES = [
  { label: 'MD5', john: 'raw-md5', hashcat: '0' },
  { label: 'SHA1', john: 'raw-sha1', hashcat: '100' },
  { label: 'SHA256', john: 'raw-sha256', hashcat: '1400' },
  { label: 'NTLM', john: 'nt', hashcat: '1000' },
  { label: 'NTLMv2', john: 'netntlmv2', hashcat: '5600' },
  { label: 'bcrypt', john: 'bcrypt', hashcat: '3200' },
  { label: 'SHA512crypt', john: 'sha512crypt', hashcat: '1800' },
];

export default function JohnPage({ onBack }) {
  const { activeJobId } = useJobs();
  const { socket } = useSocket();
  const [hashFile, setHashFile] = useState('hash.txt');
  const [wordlist, setWordlist] = useState('/usr/share/wordlists/rockyou.txt');
  const [hashType, setHashType] = useState('');
  const [tab, setTab] = useState('john');
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const johnTermId = `john-${activeJobId || 'default'}`;
  const hashTermId = `hashcat-${activeJobId || 'default'}`;

  const selected = HASH_TYPES.find(h => h.label === hashType);

  return (
    <div style={{ paddingBottom: 40 }}>
      <div className="page-header">
        <div>
          <div className="page-header-back" onClick={onBack}>← Ana Menü</div>
          <div className="page-title">🔑 <span>John & Hashcat</span></div>
          <div className="page-subtitle">Parola kırma araçları</div>
        </div>
      </div>

      <div className="page-tabs">
        {['john', 'hashcat'].map(t => (
          <div key={t} className={`page-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'john' ? '⚔ John the Ripper' : '💣 Hashcat'}
          </div>
        ))}
      </div>

      {tab === 'john' && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Hash Dosyası</label>
              <input className="form-input" value={hashFile} onChange={e => setHashFile(e.target.value)} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                Wordlist
                <span style={{ fontSize: 10, opacity: 0.6 }}>Otomatik Doldur ⤵</span>
              </label>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <button className="btn-pro btn-xs btn-outline" style={{ fontSize: 10, padding: '2px 6px' }} onClick={() => setWordlist('/usr/share/wordlists/rockyou.txt')}>Rockyou</button>
                <button className="btn-pro btn-xs btn-outline" style={{ fontSize: 10, padding: '2px 6px' }} onClick={() => setWordlist('/usr/share/seclists/Passwords/Common-Credentials/10-million-password-list-top-1000.txt')}>SecLists (Top 1K)</button>
                <button className="btn-pro btn-xs btn-outline" style={{ fontSize: 10, padding: '2px 6px' }} onClick={() => setIsPickerOpen(true)}>Gözat...</button>
              </div>
              <input className="form-input" value={wordlist} onChange={e => setWordlist(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Hash Türü (opsiyonel)</label>
              <select className="form-select" value={hashType} onChange={e => setHashType(e.target.value)}>
                <option value="">Otomatik Tespit</option>
                {HASH_TYPES.map(h => <option key={h.label} value={h.label}>{h.label} (--format={h.john})</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <button className="btn-pro btn-green" onClick={() => {
              const fmt = selected ? ` --format=${selected.john}` : '';
              sendCmd(socket, johnTermId, `john ${hashFile} --wordlist=${wordlist}${fmt}`);
            }}>⚔ Kır</button>
            <button className="btn-pro btn-cyan" onClick={() => sendCmd(socket, johnTermId, `john --show ${hashFile}`)}>
              👁 Sonuçları Göster
            </button>
            <button className="btn-pro btn-ghost btn-sm" onClick={() => sendCmd(socket, johnTermId, `john --list=formats`)}>
              📋 Format Listesi
            </button>
          </div>

          <Terminal id={johnTermId} title="John Terminal" height={240} />

          <SectionTitle icon="📋">John Referansı</SectionTitle>
          <InfoCard title="Temel Komutlar" icon="⚔" defaultOpen color="green">
            <CmdLine cmd={`john ${hashFile} --wordlist=${wordlist}`} desc="Wordlist ile kır" termId={johnTermId} />
            <CmdLine cmd={`john --show ${hashFile}`} desc="Kırılan parolaları göster" termId={johnTermId} />
            <CmdLine cmd={`john ${hashFile} --wordlist=${wordlist} --rules`} desc="Wordlist + kural seti ile kır" termId={johnTermId} />
            <CmdLine cmd={`john ${hashFile} --format=nt`} desc="NTLM hash'lerini kır" termId={johnTermId} />
            <CmdLine cmd={`john ${hashFile} --format=netntlmv2`} desc="Responder'dan gelen NTLMv2 hash" termId={johnTermId} />
          </InfoCard>
          <InfoCard title="Hash Türleri" icon="🔢" color="purple">
            <div className="cmd-desc">
              {HASH_TYPES.map(h => <div key={h.label} style={{ marginBottom: 3 }}>
                <b>{h.label}</b>: john → <code>--format={h.john}</code>
              </div>)}
            </div>
          </InfoCard>
        </>
      )}

      {tab === 'hashcat' && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Hash Dosyası</label>
              <input className="form-input" value={hashFile} onChange={e => setHashFile(e.target.value)} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                Wordlist
                <span style={{ fontSize: 10, opacity: 0.6 }}>Otomatik Doldur ⤵</span>
              </label>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <button className="btn-pro btn-xs btn-outline" style={{ fontSize: 10, padding: '2px 6px' }} onClick={() => setWordlist('/usr/share/wordlists/rockyou.txt')}>Rockyou</button>
                <button className="btn-pro btn-xs btn-outline" style={{ fontSize: 10, padding: '2px 6px' }} onClick={() => setWordlist('/usr/share/seclists/Passwords/Common-Credentials/10-million-password-list-top-1000.txt')}>SecLists (Top 1K)</button>
                <button className="btn-pro btn-xs btn-outline" style={{ fontSize: 10, padding: '2px 6px' }} onClick={() => setIsPickerOpen(true)}>Gözat...</button>
              </div>
              <input className="form-input" value={wordlist} onChange={e => setWordlist(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Hash Türü (-m)</label>
              <select className="form-select" value={hashType} onChange={e => setHashType(e.target.value)}>
                <option value="">Seç...</option>
                {HASH_TYPES.map(h => <option key={h.label} value={h.label}>{h.label} (-m {h.hashcat})</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <button className="btn-pro btn-orange" onClick={() => {
              const m = selected ? selected.hashcat : '0';
              sendCmd(socket, hashTermId, `hashcat -m ${m} ${hashFile} ${wordlist} --force`);
            }}>💣 Kır</button>
            <button className="btn-pro btn-cyan" onClick={() => sendCmd(socket, hashTermId, `hashcat -m ${selected?.hashcat || '0'} ${hashFile} --show`)}>
              👁 Sonuçları Göster
            </button>
          </div>

          <Terminal id={hashTermId} title="Hashcat Terminal" height={240} />

          <SectionTitle icon="📋">Hashcat Referansı</SectionTitle>
          <InfoCard title="Bayraklar & Modlar" icon="🏳" defaultOpen color="orange">
            <div className="cmd-desc">
              <b>-m</b>: Hash türü (0=MD5, 1000=NTLM, 1800=sha512crypt, 5600=NTLMv2)<br />
              <b>-a 0</b>: Wordlist saldırısı (varsayılan)<br />
              <b>-a 3</b>: Brute force / mask saldırısı<br />
              <b>--force</b>: Uyarıları atla (CPU modunda çalıştır)<br />
              <b>--show</b>: Kırılanları göster<br />
              <b>-r</b>: Kural dosyası uygula<br />
              <b>-o</b>: Sonuçları dosyaya kaydet
            </div>
          </InfoCard>
          <InfoCard title="Hash Modu Tablosu" icon="🔢" color="purple">
            <div className="cmd-desc">
              {HASH_TYPES.map(h => <div key={h.label} style={{ marginBottom: 3 }}>
                <b>{h.label}</b>: <code>-m {h.hashcat}</code>
              </div>)}
            </div>
          </InfoCard>
        </>
      )}

      <FilePicker 
        isOpen={isPickerOpen} 
        onClose={() => setIsPickerOpen(false)} 
        onSelect={(path) => setWordlist(path)}
        title="Wordlist Seçici"
        baseDir="/usr/share/seclists"
      />
    </div>
  );
}

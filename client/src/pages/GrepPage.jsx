import { useRef } from 'react';
import { useTerminal } from '../hooks/useTerminal';
import { InfoCard, CmdLine, SectionTitle } from '../components/InfoCard';
import { sendCmd } from '../utils/helpers';
import { useSocket } from '../context/SocketContext';

const termId = 'grep-main';

function GrepTerm() {
  const containerRef = useRef(null);
  const { isReady } = useTerminal(termId, containerRef);
  return (
    <div className="terminal-container" style={{ height: 230 }}>
      <div className="terminal-titlebar">
        <div className="terminal-dots">
          <div className="terminal-dot red" /><div className="terminal-dot yellow" /><div className="terminal-dot green" />
        </div>
        <div className="terminal-title">
          {isReady ? <span style={{ color: 'var(--accent-green)' }}>● grep</span> : <span style={{ color: 'var(--text-muted)' }}>○ bağlanıyor...</span>}
        </div>
      </div>
      <div ref={containerRef} style={{ height: 192, padding: '4px 2px' }} />
    </div>
  );
}

export default function GrepPage({ onBack }) {
  const { socket } = useSocket();
  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-header-back" onClick={onBack}>← Ana Menü</div>
          <div className="page-title">🔎 <span>Grep</span></div>
          <div className="page-subtitle">Metin arama aracı – dosyalar ve çıktılarda pattern eşleme</div>
        </div>
      </div>

      <GrepTerm />

      <div style={{ marginTop: 16 }}>
        <SectionTitle icon="📋">Grep Bayrak Referansı</SectionTitle>
        <InfoCard title="Temel Bayraklar" icon="🏳" defaultOpen color="green">
          <div className="cmd-desc">
            <b>-r</b>: Recursive – alt dizinlere de gir, tüm dosyaları tara<br />
            <b>-i</b>: Case insensitive – büyük/küçük harf fark etmez<br />
            <b>-l</b>: Sadece eşleşen dosyaların adını göster<br />
            <b>-n</b>: Satır numarası ile göster<br />
            <b>-v</b>: İnvert – pattern BULUNMAYAN satırları göster<br />
            <b>-E</b>: Extended regex kullan (egrep ile aynı)<br />
            <b>-o</b>: Sadece eşleşen kısmı göster (tüm satırı değil)<br />
            <b>-A N</b>: Eşleşmeden sonra N satır göster (After)<br />
            <b>-B N</b>: Eşleşmeden önce N satır göster (Before)<br />
            <b>-C N</b>: Eşleşme etrafında N satır göster (Context)
          </div>
        </InfoCard>
        <InfoCard title="Sızma Testi Kullanımları" icon="⚔" color="orange">
          <CmdLine cmd="grep -ri 'password' ." desc="Mevcut dizinde 'password' içeren tüm dosyaları bul" termId={termId} />
          <CmdLine cmd="grep -ri 'api_key\|secret\|token' ." desc="Gizli anahtarları ara" termId={termId} />
          <CmdLine cmd="grep -r 'flag{' ." desc="CTF bayrağı ara" termId={termId} />
          <CmdLine cmd="cat /etc/passwd | grep '/bin/bash'" desc="Geçerli shell'e sahip kullanıcılar" termId={termId} />
          <CmdLine cmd="grep -v '^#' /etc/sudoers" desc="Sudoers yorum satırları hariç" termId={termId} />
        </InfoCard>
        <InfoCard title="Regex Örnekleri (-E)" icon="✨" color="purple">
          <CmdLine cmd="grep -E '^[0-9]{1,3}(\.[0-9]{1,3}){3}$' dosya.txt" desc="IP adresi formatını ara" termId={termId} />
          <CmdLine cmd="grep -E -o '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}' dosya.txt" desc="Email adreslerini çıkar" termId={termId} />
          <CmdLine cmd="grep -n 'hata\|error\|fail' log.txt" desc="Log dosyasında hata satırlarını bul" termId={termId} />
        </InfoCard>
        <InfoCard title="find + grep Kombinasyonu" icon="🔗" color="cyan">
          <CmdLine cmd="find . -name '*.php' | xargs grep -l 'system('" desc=".php dosyalarında system() çağrısını bul" termId={termId} />
          <CmdLine cmd="find / -name '*.conf' -exec grep -l 'password' {} 2>/dev/null +" desc="Tüm .conf dosyalarında şifre ara" termId={termId} />
        </InfoCard>
      </div>
    </div>
  );
}

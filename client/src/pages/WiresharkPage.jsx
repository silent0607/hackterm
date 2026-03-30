import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useJobs } from '../context/JobContext';
import { useLanguage } from '../context/LanguageContext';
import { InfoCard, SectionTitle, CmdLine } from '../components/InfoCard';
import { Monitor, Activity, Terminal as TermIcon, Play, ShieldAlert, Wifi } from 'lucide-react';
import MultiTerminal, { useMultiTerminalId } from '../components/MultiTerminal';

export default function WiresharkPage({ onBack }) {
  const { t } = useLanguage();
  const { socket } = useSocket();
  const { activeJobId } = useJobs();
  const [running, setRunning] = useState(false);
  const termId = useMultiTerminalId('wireshark');

  // Wireshark is on Port 6082 (Display :3)
  // SSL/Nginx Cloudflare Aware VNC Urls
  const isProxied = window.location.port === ""; 
  const vncUrl = isProxied 
    ? `${window.location.origin}/vnc6082/vnc.html?path=vnc6082/websockify&autoconnect=true&view_only=false`
    : `http://${window.location.hostname}:6082/vnc.html?path=websockify&autoconnect=true&view_only=false`;

  const handleLaunch = () => {
    setRunning(true);
    // Start wireshark on display :3 with DBUS session and environment fixes
    if (socket) {
      socket.emit('terminal:create', { id: termId });
      // Use dbus-run-session to satisfy Qt requirements and capture errors to terminal
      const launchCmd = 'export XDG_RUNTIME_DIR=/tmp && DISPLAY=:3 dbus-run-session wireshark 2>&1\n';
      socket.emit(`terminal:input:${termId}`, launchCmd);
    }
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      <div className="page-header">
        <div>
          <div className="page-header-back" onClick={onBack}>{t('back_to_menu')}</div>
          <div className="page-title"><Activity size={24} style={{ verticalAlign: 'middle', marginRight: 12, color: 'var(--accent-blue)' }}/> <span>Wireshark</span></div>
          <div className="page-subtitle">Network Protocol Analyzer & Traffic Sniffer</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div>
          <SectionTitle icon={<Activity size={16} />}>Traffic Analysis GUI</SectionTitle>
          <div className="info-panel" style={{ padding: 20 }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              Wireshark uses its own dedicated deskop environment on Display :3 (Port 6082). 
              Launch it below and access the GUI via the embedded view or a new tab.
            </p>
            <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
              <button 
                className="btn-pro btn-cyan btn-full" 
                onClick={handleLaunch}
                disabled={running}
              >
                <Play size={16} /> {running ? 'Wireshark Başlatıldı' : 'Wireshark\'ı Başlat (Display :3)'}
              </button>
              <button 
                className="btn-pro btn-outline btn-full" 
                onClick={() => window.open(vncUrl, '_blank')}
              >
                <Monitor size={16} /> GUI'yi Yeni Sekmede Aç
              </button>
            </div>
          </div>
        </div>

        <div>
          <SectionTitle icon={<Wifi size={16} />}>Quick Filters</SectionTitle>
          <div className="info-panel" style={{ padding: 20 }}>
            <div className="cmd-desc" style={{ fontSize: 12 }}>
              <div style={{ marginBottom: 8 }}><b>ip.addr == 10.10.10.1</b>: Filter by Host</div>
              <div style={{ marginBottom: 8 }}><b>http.request.method == "POST"</b>: Find POST data</div>
              <div style={{ marginBottom: 8 }}><b>tcp.port == 443</b>: HTTPS traffic</div>
              <div style={{ marginBottom: 8 }}><b>dns</b>: DNS queries/responses</div>
              <div style={{ marginBottom: 0 }}><b>frame contains "password"</b>: String search</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <SectionTitle icon={<Monitor size={16} />}>Embedded View (Port 6082)</SectionTitle>
        <div className="glass-card" style={{ height: 500, overflow: 'hidden', padding: 0, position: 'relative' }}>
          <iframe 
            src={vncUrl} 
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Wireshark VNC"
          />
        </div>
      </div>

      <MultiTerminal prefix="wireshark" defaultTitle="Wireshark Controller" />

      <div style={{ marginTop: 24 }}>
        <SectionTitle icon={<ShieldAlert size={16} />}>Capture Guide</SectionTitle>
        <InfoCard title="How to capture traffic?" icon={<Wifi size={16} />} color="blue">
          <p style={{ fontSize: 13 }}>
            1. Click <b>Launch Wireshark</b> above.<br/>
            2. In the GUI, select the interface (usually <b>eth0</b>).<br/>
            3. Click the Blue Shark Fin icon to start capturing.<br/>
            4. To capture Docker-to-Docker traffic, select <b>any</b> or <b>br-XXXX</b> interface.
          </p>
        </InfoCard>
      </div>
    </div>
  );
}

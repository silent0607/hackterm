import { useState } from 'react';
import { SocketProvider, useSocket } from './context/SocketContext';
import { JobProvider } from './context/JobContext';
import Sidebar from './components/Sidebar';
import RightPanel from './components/RightPanel';

import HomePage from './pages/HomePage';
import TerminalPage from './pages/TerminalPage';
import TerminalConnectPage from './pages/TerminalConnectPage';
import FtpPage from './pages/FtpPage';
import NmapPage from './pages/NmapPage';
import WindowsPage from './pages/WindowsPage';
import RedisPage from './pages/RedisPage';
import GobusterPage from './pages/GobusterPage';
import SqlPage from './pages/SqlPage';
import PhpShellPage from './pages/PhpShellPage';
import NetworkPage from './pages/NetworkPage';
import JohnPage from './pages/JohnPage';
import AwsPage from './pages/AwsPage';
import GrepPage from './pages/GrepPage';

function Topbar({ rightOpen, onToggleRight }) {
  const { connected } = useSocket();
  return (
    <div className="topbar">
      <div className="topbar-logo">
        <span className="logo-bracket">[</span>
        <span className="logo-text">HackTool</span>
        <span className="logo-dot">·</span>
        <span style={{ color: 'var(--accent-green)' }}>Basic</span>
        <span className="logo-bracket">]</span>
      </div>
      <div className="topbar-sep" />
      <div className="topbar-status">
        <div className={`status-dot ${connected ? '' : 'offline'}`} />
        <span>{connected ? 'Sunucu bağlı' : 'Bağlanıyor...'}</span>
      </div>
      <button
        onClick={onToggleRight}
        style={{
          marginLeft: 12,
          background: rightOpen ? 'rgba(0,255,136,0.1)' : 'transparent',
          border: '1px solid ' + (rightOpen ? 'rgba(0,255,136,0.3)' : 'var(--border)'),
          color: rightOpen ? 'var(--accent-green)' : 'var(--text-muted)',
          borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12, fontFamily: 'Inter'
        }}
        title="Dosya Paneli"
      >
        📂 Dosyalar
      </button>
    </div>
  );
}

const PAGE_MAP = {
  home:       (props) => <HomePage {...props} />,
  terminal:   (props) => <TerminalPage {...props} />,
  termconn:   (props) => <TerminalConnectPage {...props} />,
  ftp:        (props) => <FtpPage {...props} />,
  nmap:       (props) => <NmapPage {...props} />,
  windows:    (props) => <WindowsPage {...props} />,
  redis:      (props) => <RedisPage {...props} />,
  gobuster:   (props) => <GobusterPage {...props} />,
  sql:        (props) => <SqlPage {...props} />,
  phpshell:   (props) => <PhpShellPage {...props} />,
  network:    (props) => <NetworkPage {...props} />,
  john:       (props) => <JohnPage {...props} />,
  aws:        (props) => <AwsPage {...props} />,
  grep:       (props) => <GrepPage {...props} />,
};

function AppInner() {
  const [page, setPage] = useState('home');
  const [rightOpen, setRightOpen] = useState(false);

  const navigate = (p) => setPage(p);
  const goBack = () => setPage('home');

  const PageComponent = PAGE_MAP[page] || PAGE_MAP['home'];

  return (
    <div className="app-layout">
      <Topbar rightOpen={rightOpen} onToggleRight={() => setRightOpen(o => !o)} />
      <Sidebar currentPage={page} onNavigate={navigate} />
      <div className="main-content">
        <div className={`page-area ${rightOpen ? 'right-open' : ''}`}>
          <PageComponent onNavigate={navigate} onBack={goBack} />
        </div>
        <RightPanel open={rightOpen} onClose={() => setRightOpen(false)} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SocketProvider>
      <JobProvider>
        <AppInner />
      </JobProvider>
    </SocketProvider>
  );
}

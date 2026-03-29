import { useState, useEffect } from 'react';
import axios from 'axios';
import { SocketProvider, useSocket } from './context/SocketContext';
import { JobProvider, useJobs } from './context/JobContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Sidebar from './components/Sidebar';
import RightPanel from './components/RightPanel';
import LoginPage from './pages/LoginPage';

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
import OpenVpnPage from './pages/OpenVpnPage';
import BurpPage from './pages/BurpPage';
import GrepPage from './pages/GrepPage';
import SettingsPage from './pages/SettingsPage';
import PackagesPage from './pages/PackagesPage';
import NotesPage from './pages/NotesPage';
import ShortcutsPage from './pages/ShortcutsPage';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';

function JobGuard({ children }) {
  const { activeJob } = useJobs();
  const { t } = useLanguage();
  if (activeJob) return children;
  return (
    <div className="guard-overlay">
      <div className="guard-box glass-card">
        <h3 style={{ color: 'var(--accent-orange)', marginBottom: 12 }}>⚠️ {t('job_required_title') || 'İş Seçimi Gerekli'}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{t('job_required_desc') || 'Herhangi bir terminal işlemi başlatmadan önce sol üstten bir hedef (İş) seçmeli veya yeni bir iş oluşturmalısınız.'}</p>
      </div>
    </div>
  );
}

function Topbar({ rightOpen, onToggleRight, onLogout, user }) {
  const { connected } = useSocket();
  const { t } = useLanguage();
  return (
    <div className="topbar">
      <div className="topbar-logo">
        <span>⬡ HackTerm</span> <span style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 400, marginLeft: 8 }}>v4.0 Pro Lab</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div className="topbar-status">
          <div className={`status-dot ${connected ? '' : 'offline'}`} />
          <span>{connected ? t('connected') : t('connecting')}</span>
        </div>
        <div className="topbar-user" style={{ fontSize: 13, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          👤 {user}
          <button className="btn-pro btn-red btn-xs" onClick={onLogout} style={{ marginLeft: 8, padding: '2px 8px' }}>Çıkış</button>
        </div>
        <button className="btn-pro btn-outline btn-sm" onClick={onToggleRight}>
          📂 {t('menu_ftp')}
        </button>
      </div>
    </div>
  );
}

function AppInner({ onLogout, user }) {
  const [page, setPage] = useState('home');
  const [rightOpen, setRightOpen] = useState(false);

  const navigate = (p) => setPage(p);
  const { refreshShortcuts } = useGlobalShortcuts(navigate);
  const goBack = () => setPage('home');

  return (
    <div className="app-layout">
      <Topbar rightOpen={rightOpen} onToggleRight={() => setRightOpen(o => !o)} onLogout={onLogout} user={user} />
      <div className="main-container">
        <Sidebar currentPage={page} onNavigate={navigate} />
        <main className="main-content">
          <div className="page-area">
            <div style={{ display: page === 'home' ? 'block' : 'none', height: '100%' }}>
              <HomePage onNavigate={navigate} />
            </div>
            <div style={{ display: page === 'terminal' ? 'block' : 'none', height: '100%' }}>
              <JobGuard><TerminalPage onNavigate={navigate} onBack={goBack} /></JobGuard>
            </div>
            <div style={{ display: page === 'nmap' ? 'block' : 'none', height: '100%' }}>
              <JobGuard><NmapPage onNavigate={navigate} onBack={goBack} /></JobGuard>
            </div>
            <div style={{ display: page === 'ftp' ? 'block' : 'none', height: '100%' }}>
              <JobGuard><FtpPage onNavigate={navigate} onBack={goBack} /></JobGuard>
            </div>
            <div style={{ display: page === 'notes' ? 'block' : 'none', height: '100%' }}>
              <NotesPage onNavigate={navigate} onBack={goBack} />
            </div>
            <div style={{ display: page === 'packages' ? 'block' : 'none', height: '100%' }}>
              <PackagesPage onNavigate={navigate} onBack={goBack} />
            </div>
            <div style={{ display: page === 'settings' ? 'block' : 'none', height: '100%' }}>
              <SettingsPage onNavigate={navigate} onBack={goBack} />
            </div>
            <div style={{ display: page === 'shortcuts' ? 'block' : 'none', height: '100%' }}>
              <ShortcutsPage onRefresh={refreshShortcuts} onNavigate={navigate} onBack={goBack} />
            </div>
            
            {['sql', 'phpshell', 'network', 'john', 'aws', 'openvpn', 'burp', 'grep', 'redis', 'windows', 'gobuster'].map(p => (
              <div key={p} style={{ display: page === p ? 'block' : 'none', height: '100%' }}>
                <JobGuard>
                  {p === 'sql' && <SqlPage onNavigate={navigate} onBack={goBack} />}
                  {p === 'phpshell' && <PhpShellPage onNavigate={navigate} onBack={goBack} />}
                  {p === 'network' && <NetworkPage onNavigate={navigate} onBack={goBack} />}
                  {p === 'john' && <JohnPage onNavigate={navigate} onBack={goBack} />}
                  {p === 'aws' && <AwsPage onNavigate={navigate} onBack={goBack} />}
                  {p === 'openvpn' && <OpenVpnPage onNavigate={navigate} onBack={goBack} />}
                  {p === 'burp' && <BurpPage onNavigate={navigate} onBack={goBack} />}
                  {p === 'grep' && <GrepPage onNavigate={navigate} onBack={goBack} />}
                  {p === 'redis' && <RedisPage onNavigate={navigate} onBack={goBack} />}
                  {p === 'windows' && <WindowsPage onNavigate={navigate} onBack={goBack} />}
                  {p === 'gobuster' && <GobusterPage onNavigate={navigate} onBack={goBack} />}
                </JobGuard>
              </div>
            ))}
          </div>
          <RightPanel open={rightOpen} onClose={() => setRightOpen(false)} />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [authenticated, setAuthenticated] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await axios.get('/api/me');
      if (res.data.authenticated) {
        setAuthenticated(true);
        setUser(res.data.user);
      } else {
        setAuthenticated(false);
      }
    } catch (e) {
      setAuthenticated(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/logout');
      setAuthenticated(false);
      setUser(null);
    } catch (e) {}
  };

  if (authenticated === null) {
      return (
          <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0e14', color: 'var(--accent-cyan)' }}>
              ⬡ HackTerm Yükleniyor...
          </div>
      );
  }

  if (!authenticated) {
      return (
          <LanguageProvider>
              <LoginPage onLogin={(u) => { setAuthenticated(true); setUser(u); }} />
          </LanguageProvider>
      );
  }

  return (
    <LanguageProvider>
      <SocketProvider>
        <JobProvider>
          <AppInner onLogout={handleLogout} user={user} />
        </JobProvider>
      </SocketProvider>
    </LanguageProvider>
  );
}

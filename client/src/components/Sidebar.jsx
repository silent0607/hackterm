import { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Terminal, 
  FileText, 
  Search, 
  FolderTree, 
  Database, 
  Shield, 
  Cpu, 
  ChevronRight, 
  Network, 
  Settings,
  Package,
  Languages,
  Home,
  Code,
  Database as DbIcon,
} from 'lucide-react';
import { useJobs } from '../context/JobContext';
import { useLanguage } from '../context/LanguageContext';

const NAV_ITEMS = [
  { id: 'home',       label: 'home',       icon: <Home size={18} /> },
  { id: 'terminal',   label: 'terminal',        icon: <Terminal size={18} /> },
  { id: 'ftp',        label: 'ftp',             icon: <FolderTree size={18} /> },
  { id: 'nmap',       label: 'nmap',            icon: <Search size={18} /> },
  { id: 'redis',      label: 'redis',           icon: <DbIcon size={18} /> },
  { id: 'openvpn',    label: 'openvpn',         icon: <Shield size={18} /> },
  { id: 'burp',       label: 'burp',      icon: <Cpu size={18} /> },
  { id: 'packages',   label: 'packages',  icon: <Package size={18} /> },
  { id: 'notes',      label: 'notes',     icon: <FileText size={18} /> },
  { id: 'settings',   label: 'settings',         icon: <Settings size={18} /> },
];

export default function Sidebar({ currentPage, onNavigate }) {
  const { jobs, activeJob, activeJobId, setActiveJobId, addJob, updateJob, deleteJob, notes, saveNotes } = useJobs();
  const { language, setLanguage, t } = useLanguage();
  const [editingJobId, setEditingJobId] = useState(null);
  const [newJobModal, setNewJobModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIp, setNewIp] = useState('');

  const handleAddJob = () => {
    addJob(newName || 'Yeni İş', newIp);
    setNewName('');
    setNewIp('');
    setNewJobModal(false);
  };

  return (
    <div className="sidebar">
      {/* Jobs Section */}
      <div className="sidebar-section">
        <button className="btn-pro btn-cyan btn-full" style={{ marginBottom: 16 }} onClick={() => setNewJobModal(true)}>
          <Plus size={18} /> {t('new_job')}
        </button>
        
        <div className="sidebar-section-label">{t('active_jobs')}</div>
        <div style={{ maxHeight: 200, overflowY: 'auto' }}>
          {jobs.length === 0 && (
            <div style={{ padding: '12px', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>
              {t('no_jobs')}
            </div>
          )}
          {jobs.map(job => (
            <div key={job.id}
              className={`sidebar-item ${job.id === activeJobId ? 'active' : ''}`}
              onClick={() => setActiveJobId(job.id)}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{job.name}</div>
                {job.ip && <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', opacity: 0.6 }}>{job.ip}</div>}
              </div>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', padding: 4 }} onClick={e => { e.stopPropagation(); deleteJob(job.id); }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">{t('tools')}</div>
        {NAV_ITEMS.map(item => (
          <div key={item.id}
            className={`sidebar-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}>
            <span className="sidebar-item-icon">{item.icon}</span>
            <span>{t(item.label)}</span>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
        <div className="sidebar-item" onClick={setLanguage} style={{ margin: 0 }}>
          <Languages size={16} />
          <span style={{ fontSize: 12, fontWeight: 600 }}>{language === 'tr' ? 'TURKISH | EN' : 'ENGLISH | TR'}</span>
        </div>
      </div>

      {/* Job Modal */}
      {newJobModal && (
        <div className="guard-overlay" style={{ zIndex: 200 }} onClick={() => setNewJobModal(false)}>
          <div className="glass-card" style={{ width: 400, padding: 32 }} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: 24, fontSize: 20 }}>⬡ {t('new_job')}</h2>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">{t('job_name_label')}</label>
              <input className="form-input" value={newName} onChange={e => setNewName(e.target.value)} autoFocus />
            </div>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">{t('target_ip_label')}</label>
              <input className="form-input" value={newIp} onChange={e => setNewIp(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddJob()} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-pro btn-outline btn-full" onClick={() => setNewJobModal(false)}>{t('cancel')}</button>
              <button className="btn-pro btn-cyan btn-full" onClick={handleAddJob}>{t('create')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
  Languages,
  Home,
  Code,
  Database as DbIcon,
} from 'lucide-react';
import { useJobs } from '../context/JobContext';
import { useLanguage } from '../context/LanguageContext';

const NAV_ITEMS = [
  { id: 'home',       label: 'home',       icon: <Home size={18} /> },
  { id: 'terminal',   label: 'terminal',        icon: <Code size={18} /> },
  { id: 'ftp',        label: 'ftp',             icon: <FolderTree size={18} /> },
  { id: 'nmap',       label: 'nmap',            icon: <Search size={18} /> },
  { id: 'redis',      label: 'redis',           icon: <DbIcon size={18} /> },
  { id: 'openvpn',    label: 'openvpn',         icon: <Shield size={18} /> },
  { id: 'burp',       label: 'burp',      icon: <Cpu size={18} /> },
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
      <div className="sidebar-section" style={{ padding: '12px 8px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px 6px', justifyContent: 'space-between' }}>
          <span className="sidebar-section-label" style={{ padding: 0 }}>{t('jobs')}</span>
          <button className="btn btn-xs btn-green" onClick={() => setNewJobModal(true)}>
            <Plus size={10} /> {t('new_job')}
          </button>
        </div>
        <div style={{ maxHeight: 120, overflowY: 'auto' }}>
          {jobs.length === 0 && (
            <div style={{ padding: '4px 12px', fontSize: 11, color: 'var(--text-muted)' }}>
              {t('no_jobs')}
            </div>
          )}
          {jobs.map(job => (
            <div key={job.id}
              className={`job-item ${job.id === activeJobId ? 'active' : ''}`}
              onClick={() => setActiveJobId(job.id)}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: job.id === activeJobId ? 'var(--accent-green)' : 'var(--text-muted)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                {editingJobId === job.id ? (
                  <input
                    autoFocus
                    className="form-input"
                    style={{ padding: '2px 6px', fontSize: 12, height: 'auto' }}
                    value={job.name}
                    onChange={e => updateJob(job.id, { name: e.target.value })}
                    onBlur={() => setEditingJobId(null)}
                    onKeyDown={e => e.key === 'Enter' && setEditingJobId(null)}
                    onClick={e => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <div className="job-name" onDoubleClick={(e) => { e.stopPropagation(); setEditingJobId(job.id); }}>{job.name}</div>
                    {job.ip && <div className="job-ip">{job.ip}</div>}
                  </>
                )}
              </div>
              <button className="job-del" onClick={e => { e.stopPropagation(); deleteJob(job.id); }}>
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>

        {/* Active job IP edit */}
        {activeJob && (
          <div style={{ padding: '6px 8px 0' }}>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px' }}>
              <span style={{ fontSize: 10, color: 'var(--accent-green)', fontFamily: 'JetBrains Mono', flexShrink: 0 }}>IP</span>
              <input
                className="form-input"
                style={{ border: 'none', padding: '0 4px', fontSize: 12, background: 'transparent', height: 'auto' }}
                placeholder={t('target_ip_label')}
                value={activeJob.ip || ''}
                onChange={e => updateJob(activeJob.ip, { ip: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>

      {/* Modal for new job */}
      {newJobModal && (
        <div className="modal-overlay" onClick={() => setNewJobModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">⬡ {t('new_job')}</div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">{t('job_name_label')}</label>
              <input className="form-input" value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="Hedef Makine 1" autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">{t('target_ip_label')}</label>
              <input className="form-input" value={newIp} onChange={e => setNewIp(e.target.value)}
                placeholder="10.10.10.10"
                onKeyDown={e => e.key === 'Enter' && handleAddJob()} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setNewJobModal(false)}>{t('cancel')}</button>
              <button className="btn btn-green" onClick={handleAddJob}><Plus size={14} /> {t('create')}</button>
            </div>
          </div>
        </div>
      )}

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

      {/* Language Switcher */}
      <div className="sidebar-footer">
        <div className="lang-switcher" onClick={setLanguage}>
          <Languages size={14} />
          <span>{language === 'tr' ? 'TR | EN' : 'EN | TR'}</span>
        </div>
        
        {/* Notes */}
        <div className="notes-area">
          <div className="notes-header">
            <FileText size={11} /> {t('notes')}
          </div>
          <textarea
            className="notes-textarea"
            placeholder={t('notes_placeholder')}
            value={notes}
            onChange={e => saveNotes(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

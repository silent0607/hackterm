import { useState } from 'react';
import { LayoutGrid, Monitor, FolderTree, Package, FileText, Settings, Languages, Home, Plus, Trash2, Pin, Keyboard, Upload, X, ShieldAlert } from 'lucide-react';
import { useJobs } from '../context/JobContext';
import { useLanguage } from '../context/LanguageContext';

const CORE_NAV = [
  { id: 'home',       label: 'home',       icon: <Home size={18} /> },
  { id: 'terminal',   label: 'terminal',   icon: <Monitor size={18} /> },
  { id: 'ftp',        label: 'ftp',        icon: <FolderTree size={18} /> },
];

const OTHER_NAV = [
  { id: 'packages',   label: 'packages',   icon: <Package size={18} /> },
  { id: 'shortcuts',  label: 'shortcuts',  icon: <Keyboard size={18} /> },
  { id: 'notes',      label: 'notes',      icon: <FileText size={18} /> },
  { id: 'settings',   label: 'settings',   icon: <Settings size={18} /> },
];

// This list defines all potential tools that can be pinned
const ALL_TOOLS = [
  { id: 'nmap',       label: 'tool_nmap',    icon: <Pin size={14} /> },
  { id: 'gobuster',   label: 'tool_gobuster',icon: <Pin size={14} /> },
  { id: 'burp',       label: 'tool_burp',    icon: <Pin size={14} /> },
  { id: 'sql',        label: 'tool_sql',     icon: <Pin size={14} /> },
  { id: 'phpshell',   label: 'tool_phpshell',icon: <Pin size={14} /> },
  { id: 'network',    label: 'tool_network', icon: <Pin size={14} /> },
  { id: 'redis',      label: 'tool_redis',   icon: <Pin size={14} /> },
  { id: 'john',       label: 'tool_john',    icon: <Pin size={14} /> },
  { id: 'windows',    label: 'tool_windows', icon: <Pin size={14} /> },
  { id: 'openvpn',    label: 'tool_openvpn', icon: <Pin size={14} /> },
  { id: 'aws',        label: 'tool_aws',     icon: <Pin size={14} /> },
  { id: 'grep',       label: 'tool_grep',    icon: <Pin size={14} /> },
  { id: 'wireshark',  label: 'tool_wireshark',icon: <Pin size={14} /> },
  { id: 'nuclei',     label: 'tool_nuclei',   icon: <Pin size={14} /> },
  { id: 'openvas',    label: 'tool_openvas',  icon: <Pin size={14} /> },
  { id: 'metasploit', label: 'tool_metasploit',icon: <Pin size={14} /> },
];

export default function Sidebar({ currentPage, onNavigate }) {
  const { jobs, activeJobId, deleteJob, addJob, pinnedTools, setActiveJobId } = useJobs();
  const { language, setLanguage, t } = useLanguage();
  const [editingJobId, setEditingJobId] = useState(null);
  const [newJobModal, setNewJobModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIp, setNewIp] = useState('');
  const [uploadModal, setUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleAddJob = () => {
    addJob(newName || 'Yeni İş', newIp);
    setNewName('');
    setNewIp('');
    setNewJobModal(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const resp = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      if (resp.ok) {
        alert(t('upload_success') || 'Dosya başarıyla yüklendi!');
        setUploadModal(false);
      }
    } catch (e) {
      alert('Upload error: ' + e.message);
    } finally {
      setUploading(false);
    }
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
        <div className="sidebar-section-label">{t('main_menu')}</div>
        {CORE_NAV.map(item => (
          <div key={item.id}
            className={`sidebar-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}>
            <span className="sidebar-item-icon">{item.icon}</span>
            <span>{t(item.label)}</span>
          </div>
        ))}

        {pinnedTools.length > 0 && (
          <>
            <div className="sidebar-section-label" style={{ marginTop: 20 }}>{t('pinned_tools')}</div>
            {ALL_TOOLS.filter(t => pinnedTools.includes(t.id)).map(item => (
              <div key={item.id}
                className={`sidebar-item ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => onNavigate(item.id)}>
                <span className="sidebar-item-icon">{item.icon}</span>
                <span>{t(item.label)}</span>
              </div>
            ))}
          </>
        )}

        <div className="sidebar-section-label" style={{ marginTop: 20 }}>{t('other')}</div>
        {OTHER_NAV.map(item => (
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

      {/* Upload Modal */}
      {uploadModal && (
        <div className="guard-overlay" style={{ zIndex: 300 }} onClick={() => setUploadModal(false)}>
          <div className="glass-card" style={{ width: 400, padding: 32 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>⬡ {t('quick_upload') || 'Dosya Yükle'}</h2>
              <X size={20} className="clickable" onClick={() => setUploadModal(false)} />
            </div>
            
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              {t('upload_desc') || 'Dosya /app/downloads dizinine kaydedilecektir.'}
            </p>

            <div className="form-group" style={{ marginBottom: 24 }}>
              <div 
                style={{ 
                  border: '2px dashed var(--border)', 
                  borderRadius: 12, 
                  padding: 40, 
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.02)',
                  cursor: 'pointer'
                }}
                onClick={() => document.getElementById('sidebar-file-input').click()}
              >
                <Upload size={32} color="var(--accent-cyan)" style={{ marginBottom: 12, opacity: 0.5 }} />
                <div style={{ fontSize: 14 }}>{uploading ? t('uploading') + '...' : t('select_file')}</div>
              </div>
              <input 
                id="sidebar-file-input" 
                type="file" 
                hidden 
                onChange={handleFileUpload} 
                disabled={uploading}
              />
            </div>
            
            <button className="btn-pro btn-outline btn-full" onClick={() => setUploadModal(false)}>{t('cancel')}</button>
          </div>
        </div>
      )}

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

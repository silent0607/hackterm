import { useState } from 'react';
import { Plus, Trash2, Terminal, FileText } from 'lucide-react';
import { useJobs } from '../context/JobContext';

const NAV_ITEMS = [
  { id: 'home',       label: 'Ana Menü',       icon: '⌂' },
  { id: 'terminal',   label: 'Terminal',        icon: '⬡' },
  { id: 'ftp',        label: 'FTP',             icon: '📁' },
  { id: 'nmap',       label: 'Nmap',            icon: '🔍' },
  { id: 'windows',    label: 'Windows',         icon: '🪟' },
  { id: 'redis',      label: 'Redis',           icon: '🗄' },
  { id: 'gobuster',   label: 'Gobuster',        icon: '🌐' },
  { id: 'sql',        label: 'SQL',             icon: '💉' },
  { id: 'phpshell',   label: 'PHP Shell',       icon: '🐚' },
  { id: 'network',    label: 'Ağ Güvenliği',    icon: '🔒' },
  { id: 'john',       label: 'John & Hashcat',  icon: '🔑' },
  { id: 'aws',        label: 'AWS',             icon: '☁' },
  { id: 'openvpn',    label: 'OpenVPN',         icon: '🛡️' },
  { id: 'burp',       label: 'Burp Suite',      icon: '🐝' },
  { id: 'grep',       label: 'Grep',            icon: '🔎' },
];

export default function Sidebar({ currentPage, onNavigate }) {
  const { jobs, activeJob, activeJobId, setActiveJobId, addJob, updateJob, deleteJob, notes, saveNotes } = useJobs();
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
          <span className="sidebar-section-label" style={{ padding: 0 }}>İşler</span>
          <button className="btn btn-xs btn-green" onClick={() => setNewJobModal(true)}>
            <Plus size={10} /> Yeni
          </button>
        </div>
        <div style={{ maxHeight: 120, overflowY: 'auto' }}>
          {jobs.length === 0 && (
            <div style={{ padding: '4px 12px', fontSize: 11, color: 'var(--text-muted)' }}>
              İş yok – Yeni ekle
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
                placeholder="Hedef IP..."
                value={activeJob.ip || ''}
                onChange={e => updateJob(activeJob.id, { ip: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>

      {/* Modal for new job */}
      {newJobModal && (
        <div className="modal-overlay" onClick={() => setNewJobModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">⬡ Yeni İş</div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">İş Adı</label>
              <input className="form-input" value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="Hedef Makine 1" autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Hedef IP (opsiyonel)</label>
              <input className="form-input" value={newIp} onChange={e => setNewIp(e.target.value)}
                placeholder="10.10.10.10"
                onKeyDown={e => e.key === 'Enter' && handleAddJob()} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setNewJobModal(false)}>İptal</button>
              <button className="btn btn-green" onClick={handleAddJob}><Plus size={14} /> Oluştur</button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Araçlar</div>
        {NAV_ITEMS.map(item => (
          <div key={item.id}
            className={`sidebar-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}>
            <span className="sidebar-item-icon">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      {/* Notes */}
      <div className="notes-area">
        <div className="notes-header">
          <FileText size={11} /> Not Tut
        </div>
        <textarea
          className="notes-textarea"
          placeholder="Buraya notlarını yaz..."
          value={notes}
          onChange={e => saveNotes(e.target.value)}
        />
      </div>
    </div>
  );
}

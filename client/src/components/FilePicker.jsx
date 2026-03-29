import { useState, useEffect } from 'react';
import { Folder, File, ChevronRight, ChevronDown, X, Check, HardDrive } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function FilePicker({ isOpen, onClose, onSelect, title, baseDir = '/app/downloads' }) {
  const { t } = useLanguage();
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState(baseDir);
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchTree = async (path) => {
    setLoading(true);
    try {
      const resp = await fetch(`/api/files/tree?base=${encodeURIComponent(path)}`);
      const data = await resp.json();
      if (data.tree) setTree(data.tree);
    } catch (e) {
      console.error('File tree error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchTree(currentPath);
  }, [isOpen, currentPath]);

  if (!isOpen) return null;

  const navigateUp = () => {
    const parts = currentPath.split('/').filter(Boolean);
    if (parts.length === 0) return;
    parts.pop();
    setCurrentPath('/' + parts.join('/'));
  };

  const commonPaths = [
    { label: 'Downloads', path: '/app/downloads' },
    { label: 'SecLists', path: '/usr/share/seclists' },
    { label: 'Wordlists', path: '/usr/share/wordlists' },
    { label: 'Root (/)', path: '/' },
  ];

  return (
    <div className="guard-overlay" style={{ zIndex: 1000 }} onClick={onClose}>
      <div className="glass-card" style={{ width: 600, maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: 0 }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>⬡ {title || t('select_file')}</h3>
          <X size={20} className="clickable" onClick={onClose} />
        </div>

        <div style={{ padding: 12, display: 'flex', gap: 8, background: 'rgba(0,0,0,0.2)' }}>
          {commonPaths.map(p => (
            <button 
              key={p.path} 
              className={`btn-pro btn-sm ${currentPath === p.path ? 'btn-cyan' : 'btn-outline'}`}
              onClick={() => { setCurrentPath(p.path); setSelectedFile(null); }}
              style={{ fontSize: 11, padding: '4px 10px' }}
            >
              <HardDrive size={12} /> {p.label}
            </button>
          ))}
        </div>

        <div style={{ padding: '8px 24px', background: 'rgba(255,255,255,0.02)', fontSize: 12, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
          {currentPath || '/'}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>{t('loading')}...</div>
          ) : (
            <div className="file-list">
              {currentPath !== '/' && (
                <div className="file-item clickable" onClick={navigateUp} style={{ padding: '8px 12px' }}>
                  <Folder size={16} color="var(--accent-purple)" />
                  <span style={{ marginLeft: 8 }}>..</span>
                </div>
              )}
              {tree.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`file-item clickable ${selectedFile === item.path ? 'selected' : ''}`}
                  onClick={() => {
                    if (item.type === 'dir') {
                      setCurrentPath(item.path);
                      setSelectedFile(null);
                    } else {
                      setSelectedFile(item.path);
                    }
                  }}
                  style={{ 
                    padding: '10px 12px', 
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    background: selectedFile === item.path ? 'rgba(var(--accent-cyan-rgb), 0.1)' : 'transparent',
                    border: selectedFile === item.path ? '1px solid var(--accent-cyan)' : '1px solid transparent'
                  }}
                >
                  {item.type === 'dir' ? <Folder size={16} color="var(--accent-purple)" /> : <File size={16} color="var(--text-muted)" />}
                  <span style={{ marginLeft: 12, fontSize: 13, flex: 1 }}>{item.name}</span>
                  {selectedFile === item.path && <Check size={14} color="var(--accent-cyan)" />}
                </div>
              ))}
              {tree.length === 0 && !loading && (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>{t('empty_directory')}</div>
              )}
            </div>
          )}
        </div>

        <div style={{ padding: 20, borderTop: '1px solid var(--border)', display: 'flex', gap: 12 }}>
          <button className="btn-pro btn-outline btn-full" onClick={onClose}>{t('cancel')}</button>
          <button 
            className="btn-pro btn-cyan btn-full" 
            disabled={!selectedFile}
            onClick={() => { onSelect(selectedFile); onClose(); }}
          >
            {t('select')}
          </button>
        </div>
      </div>

      <style jsx>{`
        .file-item:hover {
          background: rgba(255,255,255,0.05);
        }
        .file-item.selected {
          border-color: var(--accent-cyan);
        }
      `}</style>
    </div>
  );
}

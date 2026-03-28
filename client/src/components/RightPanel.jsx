import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, FileText, Folder, FolderOpen, RefreshCw, X } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { formatSize } from '../utils/helpers';

function FileNode({ node, depth = 0, onOpen }) {
  const [expanded, setExpanded] = useState(depth === 0);
  if (node.type === 'dir') {
    return (
      <div>
        <div className="file-tree-item dir" style={{ paddingLeft: 6 + depth * 14 }}
          onClick={() => setExpanded(e => !e)}>
          {expanded ? <FolderOpen size={12} /> : <Folder size={12} />}
          {expanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
          <span>{node.name}</span>
        </div>
        {expanded && node.children?.map((c, i) => (
          <FileNode key={i} node={c} depth={depth + 1} onOpen={onOpen} />
        ))}
      </div>
    );
  }
  return (
    <div className="file-tree-item" style={{ paddingLeft: 6 + depth * 14 }}
      onClick={() => onOpen && onOpen(node)}>
      <FileText size={11} style={{ color: 'var(--text-muted)' }} />
      <span>{node.name}</span>
      <span className="file-size">{formatSize(node.size || 0)}</span>
    </div>
  );
}

export default function RightPanel({ open, onClose }) {
  const { socket } = useSocket();
  const [ftpTree, setFtpTree] = useState([]);
  const [openFile, setOpenFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [infoTab, setInfoTab] = useState('ftp');

  useEffect(() => {
    fetch('/api/ftp/tree').then(r => r.json()).then(d => setFtpTree(d.tree || []));
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = ({ tree }) => setFtpTree(tree || []);
    socket.on('ftp:update', handler);
    return () => socket.off('ftp:update', handler);
  }, [socket]);

  const handleOpenFile = async (node) => {
    try {
      const r = await fetch(`/api/file?path=${encodeURIComponent(node.path)}`);
      const d = await r.json();
      setOpenFile(node);
      setFileContent(d.content || '');
    } catch { setFileContent('Dosya okunamadı'); }
  };

  const refresh = () => {
    fetch('/api/ftp/tree').then(r => r.json()).then(d => setFtpTree(d.tree || []));
  };

  return (
    <div className={`right-panel ${open ? 'open' : ''}`}>
      <div className="right-panel-header">
        <span>📂 Dosyalar</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-ghost btn-xs" onClick={refresh}><RefreshCw size={11} /></button>
          <button className="btn btn-ghost btn-xs" onClick={onClose}><X size={13} /></button>
        </div>
      </div>
      {!openFile ? (
        <div className="right-panel-body">
          <div className="page-tabs" style={{ marginBottom: 10, padding: 3 }}>
            {['ftp', 'smb'].map(t => (
              <div key={t} className={`page-tab ${infoTab === t ? 'active' : ''}`}
                onClick={() => setInfoTab(t)} style={{ textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.08em' }}>
                {t === 'ftp' ? '📁 FTP' : '🪟 SMB'}
              </div>
            ))}
          </div>
          <div className="file-tree">
            {ftpTree.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 11, padding: 8, textAlign: 'center' }}>
                Henüz dosya yok<br />
                <span style={{ fontSize: 10 }}>FTP ile get &lt;dosya&gt; kullan</span>
              </div>
            ) : (
              ftpTree.map((node, i) => <FileNode key={i} node={node} onOpen={handleOpenFile} />)
            )}
          </div>

          <div className="divider" />
          <div style={{ padding: '0 4px' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'JetBrains Mono' }}>
              💡 FTP'den toplu indir:
            </div>
            <div className="cmd-box" style={{ fontSize: 11, marginBottom: 6 }}>mget *</div>
            <div className="cmd-box" style={{ fontSize: 11 }}>prompt off</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>
              prompt off → mget * → tüm dosyaları indirir
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="btn btn-ghost btn-xs" onClick={() => setOpenFile(null)}>← Geri</button>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {openFile.name}
            </span>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: 10 }}>
            <pre style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', wordBreak: 'break-all', lineHeight: 1.6 }}>
              {fileContent}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

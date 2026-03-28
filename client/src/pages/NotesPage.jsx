import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, FileText, ChevronLeft, Save } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [editingNote, setEditingNote] = useState(null);
  const [status, setStatus] = useState('');
  const { t } = useLanguage();
  const timeoutRef = useRef(null);

  useEffect(() => {
    fetch('/api/notes')
      .then(r => r.json())
      .then(d => setNotes(Array.isArray(d) ? d : []))
      .catch(() => setNotes([]));
  }, []);

  const saveToBackend = (currentNotes) => {
    setStatus(t('saving') || 'Kaydediliyor...');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: currentNotes })
      }).then(() => setStatus(t('saved') || 'Kaydedildi')).catch(() => setStatus('Error'));
    }, 800);
  };

  const addNote = () => {
    const newNote = { id: Date.now(), title: 'Yeni Not', content: '', timestamp: new Date().toLocaleString() };
    const updated = [newNote, ...notes];
    setNotes(updated);
    setEditingNote(newNote);
    saveToBackend(updated);
  };

  const deleteNote = (e, id) => {
    e.stopPropagation();
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    saveToBackend(updated);
  };

  const updateCurrentNote = (field, value) => {
    const updatedNote = { ...editingNote, [field]: value };
    setEditingNote(updatedNote);
    const updatedNotes = notes.map(n => n.id === editingNote.id ? updatedNote : n);
    setNotes(updatedNotes);
    saveToBackend(updatedNotes);
  };

  if (editingNote) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div className="page-header" style={{ marginBottom: 20 }}>
          <div className="page-header-back" onClick={() => setEditingNote(null)}>
            <ChevronLeft size={16} /> {t('back_to_notes') || 'Notlara Dön'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <input 
              className="form-input" 
              style={{ background: 'transparent', border: 'none', fontSize: 24, fontWeight: 700, padding: 0, color: 'var(--accent-cyan)' }}
              value={editingNote.title}
              onChange={e => updateCurrentNote('title', e.target.value)}
            />
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{status}</div>
          </div>
        </div>
        <textarea
          className="form-textarea"
          style={{ flex: 1, background: 'var(--bg-card)', padding: 20, fontSize: 15, borderRadius: 16, border: '1px solid var(--border)' }}
          value={editingNote.content}
          onChange={e => updateCurrentNote('content', e.target.value)}
          placeholder={t('notes_placeholder_large')}
        />
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ justifyContent: 'space-between', alignItems: 'center', display: 'flex' }}>
        <div>
          <h1 className="page-title">📝 <span>{t('notes')}</span></h1>
          <p className="page-subtitle">{t('notes_page_desc')}</p>
        </div>
        <button className="btn-pro btn-cyan" onClick={addNote}>
          <Plus size={18} /> {t('new_note') || 'Yeni Not'}
        </button>
      </div>

      <div className="notes-grid" style={{ paddingBottom: 40 }}>
        {notes.length === 0 && (
          <div className="glass-card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
            <p>{t('no_notes_found') || 'Henüz bir not eklenmemiş.'}</p>
          </div>
        )}
        {notes.map(note => (
          <div key={note.id} className="note-card glass-card" onClick={() => setEditingNote(note)}>
            <div>
              <div className="note-card-header">{note.title || 'Başlıksız Not'}</div>
              <div className="note-card-excerpt">{note.content || (t('empty_note') || 'İçerik yok...')}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{note.timestamp}</span>
              <button className="btn-xs" style={{ color: 'var(--accent-red)', background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={e => deleteNote(e, note.id)}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

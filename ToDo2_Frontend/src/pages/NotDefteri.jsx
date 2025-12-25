import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import "./NotDefteri.css";
import { FiBookOpen, FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiDownload } from "react-icons/fi";

export default function NotDefteri() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState("");
  const [newNoteText, setNewNoteText] = useState("");
  const [showNewNote, setShowNewNote] = useState(false);
  const [enableNoteDownload, setEnableNoteDownload] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('enableNoteDownload') !== 'false';
    }
    return true;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleStorageChange = () => {
        setEnableNoteDownload(localStorage.getItem('enableNoteDownload') !== 'false');
      };
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/Notes/me");
      // Sadece not defteri notlarını göster (taskID null ve takvim notu değil)
      const notebookNotes = (res.data || []).filter(note => {
        // Takvim notları: taskID null ve [tarih] formatında başlayan
        const isCalendarNote = note.taskID === null && /^\[\d{1,2}\.\d{1,2}\.\d{4}\]/.test(note.noteText);
        // Sadece not defteri notlarını göster (taskID null ama takvim notu değil)
        return note.taskID === null && !isCalendarNote;
      });
      setNotes(notebookNotes);
    } catch (error) {
      console.error("Failed to load notes:", error);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const addNote = async () => {
    if (!newNoteText.trim()) {
      setShowNewNote(false);
      return;
    }
    try {
      await api.post("/Notes/add", {
        taskID: null,
        noteText: newNoteText
      });
      setNewNoteText("");
      setShowNewNote(false);
      loadNotes();
    } catch (error) {
      console.error("Failed to add note:", error);
    }
  };

  const updateNote = async (note) => {
    try {
      await api.put("/Notes/update", {
        noteID: note.noteID,
        taskID: null,
        noteText: editingNoteText
      });
      setEditingNoteId(null);
      setEditingNoteText("");
      loadNotes();
    } catch (error) {
      console.error("Failed to update note:", error);
    }
  };

  const deleteNote = async (noteId) => {
    const confirmMessage = "Bu notu silmek istediğinize emin misiniz?";
    if (window.confirm(confirmMessage)) {
      try {
        await api.delete(`/Notes/delete/${noteId}`);
        loadNotes();
      } catch (error) {
        console.error("Failed to delete note:", error);
      }
    }
  };

  const startEditNote = (note) => {
    setEditingNoteId(note.noteID);
    setEditingNoteText(note.noteText);
  };

  const cancelNoteEdit = () => {
    setEditingNoteId(null);
    setEditingNoteText("");
  };

  const cancelNewNote = () => {
    setNewNoteText("");
    setShowNewNote(false);
  };

  const downloadNotesAsTxt = () => {
    if (notes.length === 0) {
      alert('İndirilecek not yok.');
      return;
    }

    let content = `NOT DEFTERİ - ${new Date().toLocaleDateString('tr-TR')}\n${'='.repeat(50)}\n\n`;

    notes.forEach((note, index) => {
      const date = new Date(note.createdAt).toLocaleString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      content += `${index + 1}. ${note.noteText}\n`;
      content += `   ${date}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `not_defteri_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadSingleNote = (note) => {
    const date = new Date(note.createdAt).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let content = `NOT - ${date}\n${'='.repeat(50)}\n\n`;
    
    content += `${note.noteText}\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `not_${note.noteID}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="loading-full-page">Yükleniyor...</div>;

  return (
    <div className="todo-layout">
      <header className="page-header notebook-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FiBookOpen style={{ fontSize: '24px', color: '#7c3aed' }} />
          <h1 className="page-title">Not Defteri</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {enableNoteDownload && notes.length > 0 && (
            <button
              onClick={downloadNotesAsTxt}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--color-purple) 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(0, 120, 212, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 120, 212, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 120, 212, 0.3)';
              }}
            >
              <FiDownload />
              Notları TXT Olarak İndir
            </button>
          )}
          <button
            className="new-note-btn"
            onClick={() => setShowNewNote(true)}
          >
            <FiPlus style={{ marginRight: '8px' }} />
            Yeni Not
          </button>
        </div>
      </header>

      <div className="todo-list-container notebook-container">
        {showNewNote && (
          <div className="note-card new-note-card">
            <textarea
              className="note-textarea"
              placeholder="Notunuzu yazın..."
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              autoFocus
              rows={6}
            />
            <div className="note-actions">
              <button
                className="note-action-btn save"
                onClick={addNote}
                disabled={!newNoteText.trim()}
              >
                <FiSave style={{ marginRight: '6px' }} />
                Kaydet
              </button>
              <button
                className="note-action-btn cancel"
                onClick={cancelNewNote}
              >
                <FiX style={{ marginRight: '6px' }} />
                İptal
              </button>
            </div>
          </div>
        )}

        {notes.length === 0 && !showNewNote ? (
          <div className="no-notes-message">
            <FiBookOpen style={{ fontSize: '48px', color: '#d1d5db', marginBottom: '16px' }} />
            <p>Henüz not yok. Yeni bir not ekleyin.</p>
          </div>
        ) : (
          <div className="notes-grid">
            {notes.map((note) => (
              <div key={note.noteID} className="note-card">
                {editingNoteId === note.noteID ? (
                  <>
                    <textarea
                      className="note-textarea"
                      value={editingNoteText}
                      onChange={(e) => setEditingNoteText(e.target.value)}
                      autoFocus
                      rows={6}
                    />
                    <div className="note-actions">
                      <button
                        className="note-action-btn save"
                        onClick={() => updateNote(note)}
                        disabled={!editingNoteText.trim()}
                      >
                        <FiSave style={{ marginRight: '6px' }} />
                        Kaydet
                      </button>
                      <button
                        className="note-action-btn cancel"
                        onClick={cancelNoteEdit}
                      >
                        <FiX style={{ marginRight: '6px' }} />
                        İptal
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="note-content" onClick={() => startEditNote(note)}>
                      <p className="note-text">{note.noteText}</p>
                      <span className="note-date">
                        {new Date(note.createdAt).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="note-card-actions">
                      {enableNoteDownload && (
                        <button
                          className="note-icon-btn download"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadSingleNote(note);
                          }}
                          title="Notu İndir"
                          style={{
                            background: 'transparent',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--background-hover)';
                            e.currentTarget.style.borderColor = 'var(--accent-primary)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                          }}
                        >
                          <FiDownload />
                        </button>
                      )}
                      <button
                        className="note-icon-btn edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditNote(note);
                        }}
                        title="Düzenle"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className="note-icon-btn delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNote(note.noteID);
                        }}
                        title="Sil"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


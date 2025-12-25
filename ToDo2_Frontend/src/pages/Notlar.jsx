import { useEffect, useState, useCallback, useMemo } from "react";
import api from "../api/axios";
import { FiDownload } from "react-icons/fi";
import "./Notlar.css";

export default function Notlar() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState("");
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
      // Takvim notlarını filtrele (taskID null ve tarih formatında başlayan notları çıkar)
      const filteredNotes = (res.data || []).filter(note => {
        // Takvim notları: taskID null ve [tarih] formatında başlayan
        const isCalendarNote = note.taskID === null && /^\[\d{1,2}\.\d{1,2}\.\d{4}\]/.test(note.noteText);
        return !isCalendarNote; // Takvim notlarını çıkar
      });
      setNotes(filteredNotes);
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

  const updateNote = async (note) => {
    try {
      await api.put("/Notes/update", {
        noteID: note.noteID,
        taskID: note.taskID,
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

  const downloadNotesAsTxt = () => {
    if (notes.length === 0) {
      alert('İndirilecek not yok.');
      return;
    }

    let content = `NOTLARIM - ${new Date().toLocaleDateString('tr-TR')}\n${'='.repeat(50)}\n\n`;

    notes.forEach((note, index) => {
      const date = new Date(note.createdAt).toLocaleString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      content += `${index + 1}. ${note.noteText}\n`;
      if (note.taskID) {
        content += `   Görev #${note.taskID}\n`;
      }
      content += `   ${date}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `notlar_${new Date().toISOString().split('T')[0]}.txt`;
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
    
    content += `${note.noteText}\n\n`;
    if (note.taskID) {
      content += `Görev #${note.taskID}\n`;
    }

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
      <header className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div>
            <h1 className="page-title">Notlar</h1>
            <p className="page-subtitle">{notes.length} not</p>
          </div>
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
        </div>
      </header>

      <div className="todo-list-container">
        <div className="notes-page-container">
          {notes.length === 0 ? (
            <p className="no-tasks-message">Henüz not yok.</p>
          ) : (
            <div className="notes-grid">
              {notes.map((note) => (
                <div key={note.noteID} className="note-card">
                  {editingNoteId === note.noteID ? (
                    <div className="note-edit-mode">
                      <textarea
                        className="note-edit-textarea"
                        value={editingNoteText}
                        onChange={(e) => setEditingNoteText(e.target.value)}
                        autoFocus
                      />
                      <div className="note-edit-actions">
                        <button
                          className="note-save-btn"
                          onClick={() => updateNote(note)}
                        >
                          Kaydet
                        </button>
                        <button
                          className="note-cancel-btn"
                          onClick={cancelNoteEdit}
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="note-content" onClick={() => startEditNote(note)}>
                        <p className="note-text">{note.noteText}</p>
                        {note.taskID && (
                          <span className="note-task-badge">Görev #{note.taskID}</span>
                        )}
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
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {enableNoteDownload && (
                          <button
                            className="note-download-btn"
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
                              gap: '6px',
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
                            <FiDownload style={{ fontSize: '14px' }} />
                          </button>
                        )}
                      <button
                        className="note-delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNote(note.noteID);
                          }}
                          title="Notu Sil"
                      >
                        🗑️
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
    </div>
  );
}


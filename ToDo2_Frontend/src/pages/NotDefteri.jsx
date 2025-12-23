import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import "./NotDefteri.css";
import { FiBookOpen, FiPlus, FiEdit2, FiTrash2, FiSave, FiX } from "react-icons/fi";

export default function NotDefteri() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState("");
  const [newNoteText, setNewNoteText] = useState("");
  const [showNewNote, setShowNewNote] = useState(false);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/Notes/me");
      // Sadece taskID'si null olan notları göster (sadece not defteri notları)
      const notebookNotes = (res.data || []).filter(note => !note.taskID);
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
    if (window.confirm("Bu notu silmek istediğinize emin misiniz?")) {
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

  if (loading) return <div className="loading-full-page">Yükleniyor...</div>;

  return (
    <div className="todo-layout">
      <header className="page-header notebook-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FiBookOpen style={{ fontSize: '24px', color: '#7c3aed' }} />
          <h1 className="page-title">Not Defteri</h1>
        </div>
        <button
          className="new-note-btn"
          onClick={() => setShowNewNote(true)}
        >
          <FiPlus style={{ marginRight: '8px' }} />
          Yeni Not
        </button>
      </header>

      <div className="todo-list-container notebook-container">
        {showNewNote && (
          <div className="note-card new-note-card">
            <textarea
              className="note-textarea"
              placeholder="Notunuzu buraya yazın..."
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
                      <button
                        className="note-icon-btn edit"
                        onClick={() => startEditNote(note)}
                        title="Düzenle"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className="note-icon-btn delete"
                        onClick={() => deleteNote(note.noteID)}
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


import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import "./Notlar.css";

export default function Notlar() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState("");

  const loadNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/Notes/me");
      setNotes(res.data || []);
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
    try {
      await api.delete(`/Notes/delete/${noteId}`);
      loadNotes();
    } catch (error) {
      console.error("Failed to delete note:", error);
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

  if (loading) return <div className="loading-full-page">Yükleniyor...</div>;

  return (
    <div className="todo-layout">
      <header className="page-header">
        <h1 className="page-title">Notlarım</h1>
        <p className="page-subtitle">{notes.length} not</p>
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
                      <button
                        className="note-delete-btn"
                        onClick={() => deleteNote(note.noteID)}
                        title="Notu sil"
                      >
                        🗑️
                      </button>
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


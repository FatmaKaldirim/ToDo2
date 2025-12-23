import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import { useSearch } from "../context/SearchContext.jsx";
import "./TodoPage.css";

export default function TodoPage({ title, pageType, listId }) {
  const { searchTerm } = useSearch();
  const [tasks, setTasks] = useState([]);
  const [lists, setLists] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedListId, setSelectedListId] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [steps, setSteps] = useState([]);
  const [newStepText, setNewStepText] = useState("");

  const [notes, setNotes] = useState([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [editingStepId, setEditingStepId] = useState(null);
  const [editingStepText, setEditingStepText] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState("");
  const [taskSteps, setTaskSteps] = useState({}); // { taskID: [steps] }
  const [expandedTasks, setExpandedTasks] = useState(new Set()); // Hangi görevlerin adımları açık

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });


  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (searchTerm) {
        res = await api.get(`/Tasks/search/${searchTerm}`);
      } else {
        const url = listId ? `/Tasks/list/${listId}` : "/Tasks/list";
        res = await api.get(url);
      }
      setTasks(res.data);
    } catch (error) {
      console.error("Failed to load tasks:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [listId, searchTerm]);

  const loadLists = useCallback(async () => {
    // Günüm sayfasında liste yükleme gerekmez
    if (!listId && pageType !== "gunum") {
      try {
        const res = await api.get("/Lists/list");
        setLists(res.data);
        if (res.data.length > 0 && !selectedListId) {
          setSelectedListId(res.data[0].listID);
        }
      } catch (error) {
        console.error("Failed to load lists:", error);
      }
    }
  }, [listId, selectedListId, pageType]);

  const loadSteps = useCallback(async (taskId) => {
    if (!taskId) return;
    try {
      const res = await api.get(`/Steps/task/${taskId}`);
      setSteps(res.data || []);
    } catch (error) {
      console.error("Failed to load steps:", error);
      setSteps([]);
    }
  }, []);

  const loadStepsForTask = useCallback(async (taskId) => {
    if (!taskId) return;
    try {
      const res = await api.get(`/Steps/task/${taskId}`);
      setTaskSteps(prev => ({ ...prev, [taskId]: res.data || [] }));
    } catch (error) {
      console.error("Failed to load steps for task:", error);
      setTaskSteps(prev => ({ ...prev, [taskId]: [] }));
    }
  }, []);

  const loadNotes = useCallback(async (taskId) => {
    if (!taskId) return;
    try {
      const res = await api.get(`/Notes/me/task/${taskId}`);
      setNotes(res.data);
    } catch (error) {
      console.error("Failed to load notes:", error);
      setNotes([]);
    }
  }, []);

  useEffect(() => {
    loadTasks();
    loadLists();
  }, [loadTasks, loadLists]);

  useEffect(() => {
    if (selectedTask) {
      loadSteps(selectedTask.taskID);
      loadNotes(selectedTask.taskID);
    } else {
      setSteps([]);
      setNotes([]);
    }
  }, [selectedTask, loadSteps, loadNotes]);

  // Aktif görevler değiştiğinde adım sayılarını yükle
  useEffect(() => {
    const taskIds = activeTasks.map(t => t.taskID);
    taskIds.forEach(taskId => {
      if (taskSteps[taskId] === undefined) {
        loadStepsForTask(taskId);
      }
    });
  }, [tasks.map(t => t.taskID).join(',')]);

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    // Günüm sayfasında liste seçimi yok, listID null olmalı
    let listToAdd = null;
    if (pageType !== "gunum") {
      listToAdd = listId ? parseInt(listId) : selectedListId;
      if (!listToAdd) {
        alert("Lütfen bir liste seçin veya yeni bir tane oluşturun.");
        return;
      }
    }
    
    await api.post("/Tasks/add", { 
      taskName: newTask, 
      listID: listToAdd,
      recurrenceType: "none"
    });
    setNewTask("");
    loadTasks();
  };

  const updateTask = async (task, updates = {}) => {
    const updatedTask = { 
      ...task, 
      taskID: task.taskID,
      ...updates
    };
    await api.put("/Tasks/update", updatedTask);
    setTasks(prevTasks => prevTasks.map(t => t.taskID === task.taskID ? updatedTask : t));
    if (selectedTask && selectedTask.taskID === task.taskID) {
      setSelectedTask(updatedTask);
    }
  };
  
  const addStep = async (e) => {
    if (e.key !== "Enter" || !newStepText.trim()) return;
    await api.post('/Step/add', { taskID: selectedTask.taskID, stepText: newStepText });
    setNewStepText("");
    loadSteps(selectedTask.taskID);
  };

  const updateStep = async (step, updates = {}) => {
    await api.put('/Step/update', { 
      stepID: step.stepID, 
      taskID: step.taskID,
      stepText: updates.stepText !== undefined ? updates.stepText : step.stepText,
      isCompleted: updates.isCompleted !== undefined ? updates.isCompleted : step.isCompleted
    });
    loadSteps(selectedTask.taskID);
  };

  const deleteStep = async (stepId) => {
    try {
      await api.delete(`/Step/delete/${stepId}`);
      loadSteps(selectedTask.taskID);
    } catch (error) {
      console.error("Failed to delete step:", error);
    }
  };

  const startEditStep = (step) => {
    setEditingStepId(step.stepID);
    setEditingStepText(step.stepText);
  };

  const saveStepEdit = async (step) => {
    if (editingStepText.trim()) {
      await updateStep(step, { stepText: editingStepText });
    }
    setEditingStepId(null);
    setEditingStepText("");
  };

  const cancelStepEdit = () => {
    setEditingStepId(null);
    setEditingStepText("");
  };

  const addNote = async () => {
    if (!newNoteText.trim()) return;
    await api.post('/Notes/add', { taskID: selectedTask.taskID, noteText: newNoteText });
    setNewNoteText("");
    loadNotes(selectedTask.taskID);
  };

  const deleteNote = async (noteId) => {
    await api.delete(`/Notes/delete/${noteId}`);
    loadNotes(selectedTask.taskID);
  };

  const updateNote = async (note) => {
    await api.put('/Notes/update', { 
      noteID: note.noteID, 
      taskID: note.taskID,
      noteText: editingNoteText 
    });
    setEditingNoteId(null);
    setEditingNoteText("");
    loadNotes(selectedTask.taskID);
  };

  const startEditNote = (note) => {
    setEditingNoteId(note.noteID);
    setEditingNoteText(note.noteText);
  };

  const cancelNoteEdit = () => {
    setEditingNoteId(null);
    setEditingNoteText("");
  };

  const TaskStepsList = ({ taskId, steps, onStepsChange }) => {
    const [localSteps, setLocalSteps] = useState(steps);
    const [newStepText, setNewStepText] = useState("");
    const [editingStepId, setEditingStepId] = useState(null);
    const [editingStepText, setEditingStepText] = useState("");

    useEffect(() => {
      setLocalSteps(steps);
    }, [steps]);

    const updateStepInline = async (step, updates) => {
      try {
        await api.put("/Steps/update", {
          stepID: step.stepID,
          stepText: updates.stepText !== undefined ? updates.stepText : step.stepText,
          isCompleted: updates.isCompleted !== undefined ? updates.isCompleted : step.isCompleted
        });
        onStepsChange();
      } catch (error) {
        console.error("Failed to update step:", error);
      }
    };

    const deleteStepInline = async (stepId) => {
      try {
        await api.delete(`/Steps/delete/${stepId}`);
        onStepsChange();
      } catch (error) {
        console.error("Failed to delete step:", error);
      }
    };

    const addStepInline = async (e) => {
      if (e.key === 'Enter' && newStepText.trim()) {
        try {
          await api.post("/Steps/add", {
            taskID: taskId,
            stepText: newStepText
          });
          setNewStepText("");
          onStepsChange();
        } catch (error) {
          console.error("Failed to add step:", error);
        }
      }
    };

    const startEditStepInline = (step) => {
      setEditingStepId(step.stepID);
      setEditingStepText(step.stepText);
    };

    const saveStepEditInline = (step) => {
      if (editingStepText.trim()) {
        updateStepInline(step, { stepText: editingStepText });
      }
      setEditingStepId(null);
      setEditingStepText("");
    };

    const cancelStepEditInline = () => {
      setEditingStepId(null);
      setEditingStepText("");
    };

    return (
      <div className="inline-steps-container">
        {localSteps.map(step => (
          <div key={step.stepID} className={`inline-step-row ${step.isCompleted ? "step-completed" : ""}`}>
            <button
              className={`check-btn ${step.isCompleted ? "filled" : ""}`}
              onClick={() => updateStepInline(step, { isCompleted: !step.isCompleted })}
              title={step.isCompleted ? "Tamamlandı olarak işaretle" : "Tamamlandı"}
            />
            {editingStepId === step.stepID ? (
              <input
                className="step-input"
                type="text"
                value={editingStepText}
                onChange={(e) => setEditingStepText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveStepEditInline(step);
                  if (e.key === 'Escape') cancelStepEditInline();
                }}
                onBlur={() => saveStepEditInline(step)}
                autoFocus
                style={{ flex: 1 }}
              />
            ) : (
              <>
                <span
                  className={`step-text ${step.isCompleted ? "done" : ""}`}
                  onClick={() => startEditStepInline(step)}
                  style={{ cursor: 'text', flex: 1 }}
                >
                  {step.stepText}
                </span>
                <button
                  className="delete-step-btn"
                  onClick={() => deleteStepInline(step.stepID)}
                  title="Adımı sil"
                >
                  🗑️
                </button>
              </>
            )}
          </div>
        ))}
        <div className="inline-step-row add-step">
          <button className="check-btn" disabled style={{ opacity: 0.3 }} />
          <input
            className="step-input"
            type="text"
            placeholder="Adım ekle..."
            value={newStepText}
            onChange={(e) => setNewStepText(e.target.value)}
            onKeyDown={addStepInline}
            style={{ flex: 1, fontStyle: 'italic', color: '#9ca3af' }}
          />
        </div>
      </div>
    );
  };

  const getFilteredTasks = () => {
    if (searchTerm) return { active: tasks.filter(t => !t.isCompleted), completed: tasks.filter(t => t.isCompleted) };
    if (listId) return { active: tasks.filter(t => !t.isCompleted), completed: tasks.filter(t => t.isCompleted) };
    const active = tasks.filter(t => {
      if (pageType === "gunum") return t.isCompleted === false;
      if (pageType === "onemli") return t.isImportant && !t.isCompleted;
      if (pageType === "planlanan") return t.dueDate && !t.isCompleted;
      return !t.isCompleted;
    });
    const completed = tasks.filter(t => t.isCompleted);
    return { active, completed };
  };

  const { active: activeTasks, completed: completedTasks } = getFilteredTasks();

  if (loading) return <div className="loading-full-page">Loading...</div>;

  return (
    <div className="todo-layout">
      <header className="page-header">
        <h1 className="page-title">{searchTerm ? `Search Results` : title}</h1>
        {pageType === "gunum" && <p className="page-subtitle">{today}</p>}
      </header>

      <div className="todo-list-container">
      <div className="todo-list">
          {activeTasks.length === 0 && completedTasks.length === 0 && (<p className="no-tasks-message">No tasks here yet. Add one below!</p>)}
          
          <ul className="task-ul">
            {activeTasks.map(task => {
              const taskStepsList = taskSteps[task.taskID] || [];
              const isExpanded = expandedTasks.has(task.taskID);
              
              return (
                <li key={task.taskID} className="task-item-wrapper">
                  <div className="task-row" onClick={() => {
                    setSelectedTask(task);
                    if (!taskSteps[task.taskID]) {
                      loadStepsForTask(task.taskID);
                    }
                  }}>
                    <button className={`check-btn ${task.isCompleted ? "filled" : ""}`} onClick={(e) => { e.stopPropagation(); updateTask({ ...task, isCompleted: true }); }} />
                    <span className="task-name">{task.taskName}</span>
                    <button 
                      className="expand-steps-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (taskSteps[task.taskID] === undefined) {
                          loadStepsForTask(task.taskID);
                        }
                        setExpandedTasks(prev => {
                          const newSet = new Set(prev);
                          if (newSet.has(task.taskID)) {
                            newSet.delete(task.taskID);
                          } else {
                            newSet.add(task.taskID);
                          }
                          return newSet;
                        });
                      }}
                      title={isExpanded ? "Adımları gizle" : "Adımları göster"}
                    >
                      {isExpanded ? "▼" : "▶"} {taskStepsList.length > 0 ? taskStepsList.length : ""}
                    </button>
                    <button className={`star-btn ${task.isImportant ? "important" : ""}`} onClick={(e) => { e.stopPropagation(); updateTask({ ...task, isImportant: !task.isImportant }); }}>
                      {task.isImportant ? "★" : "☆"}
                    </button>
                  </div>
                  {isExpanded && (
                    <TaskStepsList 
                      taskId={task.taskID}
                      steps={taskStepsList}
                      onStepsChange={() => loadStepsForTask(task.taskID)}
                    />
                  )}
                </li>
              );
            })}
          </ul>

        {completedTasks.length > 0 && (
          <>
              <h4 className="completed-title">Completed</h4>
            <ul className="task-ul">
              {completedTasks.map(task => (
                  <li key={task.taskID} className="task-row done" onClick={() => setSelectedTask(task)}>
                    <button className="check-btn filled" onClick={(e) => { e.stopPropagation(); updateTask({ ...task, isCompleted: false }); }} />
                  <span className="task-name">{task.taskName}</span>
                </li>
              ))}
            </ul>
          </>
        )}
        </div>
      </div>

      <form className="add-task-bar" onSubmit={addTask}>
        {!listId && lists.length > 0 && !searchTerm && pageType !== "gunum" && (
          <select className="list-select" value={selectedListId} onChange={e => setSelectedListId(e.target.value)}>
            {lists.map(list => (<option key={list.listID} value={list.listID}>{list.listName}</option>))}
          </select>
        )}
        <span style={{ fontSize: '18px', color: '#9ca3af', marginRight: '8px' }}>○</span>
        <input 
          placeholder="Görev ekle" 
          value={newTask} 
          onChange={(e) => setNewTask(e.target.value)} 
        />
      </form>

      <aside className={`task-detail ${selectedTask ? "open" : ""}`}>
        <button className="close-btn" onClick={() => setSelectedTask(null)}>✕</button>
        {selectedTask && (
          <>
            {/* Task Title */}
            <div className="detail-card header-card">
              <input
                className="detail-title"
                type="text"
                value={selectedTask.taskName || ""}
                onChange={(e) => updateTask(selectedTask, { taskName: e.target.value })}
                onBlur={() => updateTask(selectedTask)}
                style={{ border: 'none', background: 'transparent', padding: 0, width: '100%', fontSize: '20px', fontWeight: '600' }}
              />
            </div>

            {/* Task Content/Description */}
            <div className="detail-card">
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#6c757d', marginBottom: '8px', display: 'block' }}>
                Açıklama
              </label>
              <textarea
                className="detail-note"
                placeholder="Açıklama ekle..."
                value={selectedTask.taskContent || ""}
                onChange={(e) => updateTask(selectedTask, { taskContent: e.target.value })}
                onBlur={() => updateTask(selectedTask)}
                style={{ minHeight: '80px' }}
              />
            </div>

            {/* Due Date */}
            <div className="detail-card action" onClick={(e) => e.stopPropagation()}>
              <span className="detail-title">Son tarih</span>
              <input
                type="date"
                value={selectedTask.dueDate ? new Date(selectedTask.dueDate).toISOString().split('T')[0] : ""}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value).toISOString() : null;
                  updateTask(selectedTask, { dueDate: date });
                }}
                onBlur={() => updateTask(selectedTask)}
              />
            </div>

            {/* Reminder Date */}
            <div className="detail-card action" onClick={(e) => e.stopPropagation()}>
              <span className="detail-title">Hatırlatma</span>
              <input
                type="datetime-local"
                value={selectedTask.reminderDate ? new Date(selectedTask.reminderDate).toISOString().slice(0, 16) : ""}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value).toISOString() : null;
                  updateTask(selectedTask, { reminderDate: date });
                }}
                onBlur={() => updateTask(selectedTask)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #dee2e6',
                  color: '#1f2937',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  marginLeft: 'auto',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Important Toggle */}
            <div className="detail-card action" onClick={() => updateTask(selectedTask, { isImportant: !selectedTask.isImportant })}>
              <span className="detail-title">Önemli</span>
              <button
                className={`star-btn ${selectedTask.isImportant ? "important" : ""}`}
                style={{ fontSize: '24px', marginLeft: 'auto' }}
              >
                {selectedTask.isImportant ? "★" : "☆"}
              </button>
            </div>

            {/* Recurrence Type */}
            <div className="detail-card action">
              <span className="detail-title">Tekrarlama</span>
              <select
                value={selectedTask.recurrenceType || "none"}
                onChange={(e) => {
                  updateTask(selectedTask, { recurrenceType: e.target.value });
                }}
                onBlur={() => updateTask(selectedTask)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  marginLeft: 'auto',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <option value="none">Yok</option>
                <option value="daily">Günlük</option>
                <option value="weekly">Haftalık</option>
                <option value="monthly">Aylık</option>
              </select>
            </div>

            {/* Steps Section */}
            <div className="detail-card">
              <h3 className="detail-title" style={{ fontSize: '16px', marginBottom: '12px' }}>Adımlar</h3>
              <div className="steps">
                {steps.map(step => (
                  <div key={step.stepID} className={`step-row ${step.isCompleted ? "step-completed" : ""}`}>
                    <button
                      className={`check-btn ${step.isCompleted ? "filled" : ""}`}
                      onClick={() => updateStep(step, { isCompleted: !step.isCompleted })}
                      title={step.isCompleted ? "Tamamlandı olarak işaretle" : "Tamamlandı"}
                    />
                    {editingStepId === step.stepID ? (
                      <input
                        className="step-input"
                        type="text"
                        value={editingStepText}
                        onChange={(e) => setEditingStepText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveStepEdit(step);
                          if (e.key === 'Escape') cancelStepEdit();
                        }}
                        onBlur={() => saveStepEdit(step)}
                        autoFocus
                        style={{ flex: 1 }}
                      />
                    ) : (
                      <>
                        <span
                          className={`step-text ${step.isCompleted ? "done" : ""}`}
                          onClick={() => startEditStep(step)}
                          style={{ cursor: 'text', flex: 1 }}
                        >
                          {step.stepText}
                        </span>
                        <button
                          className="delete-step-btn"
                          onClick={() => deleteStep(step.stepID)}
                          title="Adımı sil"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                ))}
                <div className="step-row add-step">
                  <button className="check-btn" disabled style={{ opacity: 0.3 }} />
                  <input
                    className="step-input"
                    type="text"
                    placeholder="Adım ekle..."
                    value={newStepText}
                    onChange={(e) => setNewStepText(e.target.value)}
                    onKeyDown={addStep}
                    style={{ flex: 1, fontStyle: 'italic', color: '#9ca3af' }}
                  />
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="detail-card notes-section">
              <h3 className="detail-title" style={{ fontSize: '16px', marginBottom: '12px' }}>Notlar</h3>
              <div className="notes-list">
                {notes.map(note => (
                  <div key={note.noteID} className="note-item">
                    {editingNoteId === note.noteID ? (
                      <div style={{ width: '100%' }}>
                        <textarea
                          className="detail-note"
                          value={editingNoteText}
                          onChange={(e) => setEditingNoteText(e.target.value)}
                          style={{ minHeight: '80px', marginBottom: '8px', width: '100%' }}
                          autoFocus
                        />
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => updateNote(note)}
                            style={{
                              padding: '6px 12px',
                              background: '#667eea',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            Kaydet
                          </button>
                          <button
                            onClick={cancelNoteEdit}
                            style={{
                              padding: '6px 12px',
                              background: '#e5e7eb',
                              color: '#1f2937',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            İptal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p onClick={() => startEditNote(note)} style={{ cursor: 'text', flex: 1, marginRight: '8px' }}>{note.noteText}</p>
                        <button
                          className="delete-note-btn"
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
              <textarea
                className="detail-note"
                placeholder="Not ekle..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
              />
              <button className="add-note-btn" onClick={addNote}>
                Not Ekle
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
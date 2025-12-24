import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import { useSearch } from "../context/SearchContext.jsx";
import { FiStar, FiClock, FiCalendar, FiRepeat, FiFileText, FiTrash2, FiX } from "react-icons/fi";
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
  const [showStepsSection, setShowStepsSection] = useState(false); // Adımlar bölümü görünür mü
  const [showNotesSection, setShowNotesSection] = useState(false); // Notlar bölümü görünür mü

  const today = new Date().toLocaleDateString('tr-TR', { weekday: 'long', month: 'long', day: 'numeric' });


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
      // Eğer adım veya not varsa, ilgili bölümü otomatik aç
      setShowStepsSection(false);
      setShowNotesSection(false);
    } else {
      setSteps([]);
      setNotes([]);
      setShowStepsSection(false);
      setShowNotesSection(false);
    }
  }, [selectedTask, loadSteps, loadNotes]);

  // Adımlar veya notlar yüklendiğinde, varsa bölümleri aç (sadece ilk yüklemede)
  useEffect(() => {
    if (steps.length > 0 && selectedTask) {
      // Eğer bölüm kapalıysa ve adımlar varsa aç
      if (!showStepsSection) {
        setShowStepsSection(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps.length, selectedTask?.taskID]);

  useEffect(() => {
    if (notes.length > 0 && selectedTask) {
      // Eğer bölüm kapalıysa ve notlar varsa aç
      if (!showNotesSection) {
        setShowNotesSection(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes.length, selectedTask?.taskID]);

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
    e.preventDefault(); // Form submit'i engelle
    try {
      await api.post('/Step/add', { taskID: selectedTask.taskID, stepText: newStepText });
      setNewStepText("");
      loadSteps(selectedTask.taskID);
      // Adım eklendikten sonra bölümü açık tut
      setShowStepsSection(true);
    } catch (error) {
      console.error("Failed to add step:", error);
    }
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
    // Not eklendikten sonra bölümü açık tut
    setShowNotesSection(true);
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
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const active = tasks.filter(t => {
      if (pageType === "gunum") {
        // Günüm sayfasında sadece bugünün görevlerini göster
        // Eğer görev bugünden önce oluşturulmuşsa ve tamamlanmamışsa göster
        if (t.isCompleted) return false;
        // Bugün oluşturulmuş veya bugün için planlanmış görevler
        const createdDate = t.createdDate ? new Date(t.createdDate) : null;
        if (createdDate) {
          createdDate.setHours(0, 0, 0, 0);
          // Bugün veya bugünden sonra oluşturulmuş görevler
          return createdDate >= today;
        }
        return true; // Tarih bilgisi yoksa göster
      }
      if (pageType === "onemli") return t.isImportant && !t.isCompleted; // Sadece önemli ve tamamlanmamış
      if (pageType === "planlanan") return t.dueDate && !t.isCompleted;
      return !t.isCompleted;
    });
    // Önemli sayfasında tamamlanan görevleri gösterme
    const completed = pageType === "onemli" ? [] : tasks.filter(t => t.isCompleted);
    return { active, completed };
  };

  const { active: activeTasks, completed: completedTasks } = getFilteredTasks();
  const [showCompleted, setShowCompleted] = useState(() => {
    return localStorage.getItem('showCompletedTasks') !== 'false';
  });

  useEffect(() => {
    const stored = localStorage.getItem('showCompletedTasks');
    setShowCompleted(stored !== 'false');
  }, []);

  if (loading) return <div className="loading-full-page">Loading...</div>;

  return (
    <div className="todo-layout">
      <header className="page-header">
        <h1 className="page-title">{searchTerm ? `Search Results` : title}</h1>
        {pageType === "gunum" && <p className="page-subtitle">{today}</p>}
      </header>

      <div className="todo-list-container">
      <div className="todo-list">
          {activeTasks.length === 0 && completedTasks.length === 0 && (<p className="no-tasks-message">Henüz görev yok. Aşağıdan bir tane ekleyin!</p>)}
          
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

        {showCompleted && completedTasks.length > 0 && (
          <>
              <h4 className="completed-title">Tamamlanan</h4>
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
        <div style={{ 
          width: '24px', 
          height: '24px', 
          borderRadius: '6px', 
          border: '2px solid #d1d5db', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexShrink: 0,
          marginRight: '8px',
          background: 'linear-gradient(135deg, #ffffff 0%, #fef7ff 100%)',
          transition: 'all 0.2s ease'
        }}>
          <span style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1 }}>+</span>
        </div>
        <input 
          placeholder="Yeni görev ekle..." 
          value={newTask} 
          onChange={(e) => setNewTask(e.target.value)} 
        />
      </form>

      <aside 
        className={`task-detail ${selectedTask ? "open" : ""}`}
        onTransitionEnd={() => {
          if (selectedTask) {
            document.body.classList.add('task-detail-open');
          } else {
            document.body.classList.remove('task-detail-open');
          }
        }}
      >
        <button className="close-btn" onClick={() => {
          setSelectedTask(null);
          document.body.classList.remove('task-detail-open');
        }}>
          <FiX />
        </button>
        {selectedTask && (
          <>
            {/* Task Title with Star */}
            <div className="detail-card header-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                <button
                  className={`star-btn ${selectedTask.isImportant ? "important" : ""}`}
                  onClick={() => updateTask(selectedTask, { isImportant: !selectedTask.isImportant })}
                  style={{ fontSize: '20px', padding: '4px', flexShrink: 0 }}
                >
                  <FiStar style={{ fill: selectedTask.isImportant ? 'currentColor' : 'none' }} />
                </button>
              <input
                className="detail-title"
                type="text"
                value={selectedTask.taskName || ""}
                onChange={(e) => updateTask(selectedTask, { taskName: e.target.value })}
                onBlur={() => updateTask(selectedTask)}
                  style={{ border: 'none', background: 'transparent', padding: 0, width: '100%', fontSize: '20px', fontWeight: '600', flex: 1 }}
              />
            </div>
            </div>

            {/* Add Step Button */}
            <div className="detail-card action" onClick={(e) => {
              e.stopPropagation();
              setShowStepsSection(!showStepsSection);
              if (!showStepsSection) {
                // Bölüm açılıyorsa, input'a focus ver
                setTimeout(() => {
                  const input = document.querySelector('.step-input');
                  if (input) input.focus();
                }, 100);
              }
            }}>
              <span className="detail-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px', fontWeight: '600' }}>+</span>
                <span>Adım ekle</span>
              </span>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                {showStepsSection ? '▼' : '▶'}
              </span>
            </div>

            {/* Steps Section - Dynamic */}
            {showStepsSection && (
              <div className="detail-card steps-section">
                {steps.length > 0 && (
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
                              <FiTrash2 style={{ fontSize: '14px' }} />
                        </button>
                      </>
                    )}
                  </div>
                ))}
                  </div>
                )}
                <div className="step-row add-step">
                  <button className="check-btn" disabled style={{ opacity: 0.3 }} />
                  <input
                    className="step-input"
                    type="text"
                    placeholder="Adım ekle..."
                    value={newStepText}
                    onChange={(e) => setNewStepText(e.target.value)}
                    onKeyDown={addStep}
                    style={{ flex: 1, fontStyle: 'italic', color: 'var(--text-tertiary)' }}
                  />
                </div>
              </div>
            )}


            {/* Remind Me */}
            <div className="detail-card action" onClick={(e) => e.stopPropagation()}>
              <span className="detail-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FiClock style={{ fontSize: '18px', color: 'var(--text-secondary)' }} />
                <span>Hatırlatma</span>
              </span>
              <input
                type="datetime-local"
                value={selectedTask.reminderDate ? new Date(selectedTask.reminderDate).toISOString().slice(0, 16) : ""}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value).toISOString() : null;
                  updateTask(selectedTask, { reminderDate: date });
                }}
                onBlur={() => updateTask(selectedTask)}
                style={{
                  background: 'var(--background-primary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '6px 10px',
                  borderRadius: '4px',
                  marginLeft: 'auto',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Add Due Date */}
            <div className="detail-card action" onClick={(e) => e.stopPropagation()}>
              <span className="detail-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FiCalendar style={{ fontSize: '18px', color: 'var(--text-secondary)' }} />
                <span>Son tarih</span>
              </span>
              <input
                type="date"
                value={selectedTask.dueDate ? new Date(selectedTask.dueDate).toISOString().split('T')[0] : ""}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value).toISOString() : null;
                  updateTask(selectedTask, { dueDate: date });
                }}
                onBlur={() => updateTask(selectedTask)}
                style={{
                  background: 'var(--background-primary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '6px 10px',
                  borderRadius: '4px',
                  marginLeft: 'auto',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Repeat */}
            <div className="detail-card action" onClick={(e) => e.stopPropagation()}>
              <span className="detail-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FiRepeat style={{ fontSize: '18px', color: 'var(--text-secondary)' }} />
                <span>Yinele</span>
              </span>
              <select
                value={selectedTask.recurrenceType || "none"}
                onChange={(e) => {
                  updateTask(selectedTask, { recurrenceType: e.target.value });
                }}
                onBlur={() => updateTask(selectedTask)}
                style={{
                  background: 'var(--background-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  padding: '6px 10px',
                  marginLeft: 'auto',
                  fontSize: '14px',
                  cursor: 'pointer',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="none">Yok</option>
                <option value="daily">Günlük</option>
                <option value="weekly">Haftalık</option>
                <option value="monthly">Aylık</option>
              </select>
            </div>

            {/* Add Note */}
            <div className="detail-card action" onClick={(e) => {
              e.stopPropagation();
              setShowNotesSection(!showNotesSection);
              if (!showNotesSection) {
                // Bölüm açılıyorsa, textarea'ya focus ver
                setTimeout(() => {
                  const textarea = document.querySelector('.detail-note');
                  if (textarea) textarea.focus();
                }, 100);
              }
            }}>
              <span className="detail-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FiFileText style={{ fontSize: '18px', color: 'var(--text-secondary)' }} />
                <span>Not ekle</span>
              </span>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                {showNotesSection ? '▼' : '▶'}
              </span>
            </div>

            {/* Notes Section - Dynamic */}
            {showNotesSection && (
            <div className="detail-card notes-section">
                {notes.length > 0 && (
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
                                  background: 'var(--accent-primary)',
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
                                  background: 'var(--background-hover)',
                                  color: 'var(--text-primary)',
                                  border: '1px solid var(--border-color)',
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
                            <p onClick={() => startEditNote(note)} style={{ cursor: 'text', flex: 1 }}>{note.noteText}</p>
                            <div className="note-actions">
                        <button
                          className="delete-note-btn"
                                onClick={(e) => { e.stopPropagation(); deleteNote(note.noteID); }}
                          title="Notu sil"
                        >
                                <FiTrash2 style={{ fontSize: '14px' }} />
                        </button>
                            </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
                )}
                <div className="note-input-container">
              <textarea
                className="detail-note"
                placeholder="Not ekle..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                    style={{ marginTop: notes.length > 0 ? '12px' : '0' }}
              />
                  {newNoteText.trim() && (
                    <button className="add-note-btn" onClick={addNote} style={{ marginTop: '8px' }}>
                Not Ekle
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Task Metadata - Created date and delete */}
            <div className="detail-card metadata-card">
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {selectedTask.createdAt ? 
                  new Date(selectedTask.createdAt).toLocaleString('tr-TR', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) + ' oluşturuldu' : 
                  'Oluşturulma tarihi bilinmiyor'}
              </span>
              <button
                className="delete-task-btn"
                onClick={() => {
                  if (window.confirm('Bu görevi silmek istediğinize emin misiniz?')) {
                    // Delete task logic here
                    setSelectedTask(null);
                  }
                }}
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  cursor: 'pointer', 
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--text-secondary)'
                }}
                title="Görevi sil"
              >
                <FiTrash2 style={{ fontSize: '16px' }} />
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
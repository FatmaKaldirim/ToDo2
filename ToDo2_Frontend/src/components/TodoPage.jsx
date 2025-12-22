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
    if (!listId) {
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
  }, [listId, selectedListId]);

  const loadSteps = useCallback(async (taskId) => {
    if (!taskId) return;
    try {
      const res = await api.get(`/Steps/task/${taskId}`);
      setSteps(res.data);
    } catch (error) {
      console.error("Failed to load steps:", error);
      setSteps([]);
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

  const addTask = async (e) => {
    // Allow Enter key or button click
    if (e && e.type === 'keydown' && e.key !== "Enter") return;
    if (!newTask.trim()) return;
    const listToAdd = listId ? parseInt(listId) : selectedListId;
    if (!listToAdd) {
        alert("Lütfen bir liste seçin veya yeni bir tane oluşturun.");
        return;
    }
    await api.post("/Tasks/add", { taskName: newTask, listID: listToAdd });
    setNewTask("");
    loadTasks();
  };

  const updateTask = async (task) => {
    await api.put("/Tasks/update", { ...task, taskID: task.taskID });
    setTasks(prevTasks => prevTasks.map(t => t.taskID === task.taskID ? task : t));
    if (selectedTask && selectedTask.taskID === task.taskID) {
      setSelectedTask(task);
    }
  };
  
  const addStep = async (e) => {
    if (e.key !== "Enter" || !newStepText.trim()) return;
    await api.post('/Steps/add', { taskID: selectedTask.taskID, stepText: newStepText });
    setNewStepText("");
    loadSteps(selectedTask.taskID);
  };

  const updateStep = async (step) => {
    await api.put('/Steps/update', { ...step, isCompleted: !step.isCompleted });
    loadSteps(selectedTask.taskID);
  };

  const deleteStep = async (stepId) => {
    await api.delete(`/Steps/delete/${stepId}`);
    loadSteps(selectedTask.taskID);
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

  if (loading) return <div className="loading-full-page">Yükleniyor...</div>;

  return (
    <div className="todo-layout">
      <div className="todo-list">
        <h1>{searchTerm ? `Arama Sonuçları: "${searchTerm}"` : title}</h1>
        {activeTasks.length === 0 && completedTasks.length === 0 && (<p className="no-tasks-message">Henüz görev yok.</p>)}
        {activeTasks.length > 0 && (
          <ul className="task-ul">
            {activeTasks.map(task => (
              <li key={task.taskID} className="task-row" onClick={() => setSelectedTask(task)}>
                <button className="check-btn" onClick={(e) => { e.stopPropagation(); updateTask({ ...task, isCompleted: true }); }} />
                <span className="task-name">{task.taskName}</span>
                <button className="star-btn" onClick={(e) => { e.stopPropagation(); updateTask({ ...task, isImportant: !task.isImportant }); }}>
                  {task.isImportant ? "★" : "☆"}
                </button>
              </li>
            ))}
          </ul>
        )}
        {completedTasks.length > 0 && (
          <>
            <h4 className="completed-title">Tamamlandı</h4>
            <ul className="task-ul">
              {completedTasks.map(task => (
                <li key={task.taskID} className="task-row done">
                  <button className="check-btn filled" onClick={() => updateTask({ ...task, isCompleted: false })} />
                  <span className="task-name">{task.taskName}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="add-task-bar">
        {!listId && lists.length > 0 && !searchTerm && (
          <select className="list-select" value={selectedListId} onChange={e => setSelectedListId(e.target.value)}>
            {lists.map(list => (<option key={list.listID} value={list.listID}>{list.listName}</option>))}
          </select>
        )}
        <input 
          placeholder="Görev ekle" 
          value={newTask} 
          onChange={(e) => setNewTask(e.target.value)} 
          onKeyDown={addTask} 
        />
        <button className="add-task-btn" onClick={addTask} type="button">
          Ekle
        </button>
      </div>

      <aside className={`task-detail ${selectedTask ? "open" : ""}`}>
        <button className="close-btn" onClick={() => setSelectedTask(null)}>✕</button>
        {selectedTask && (
          <>
            <div className="detail-card header-card">
              <button className="check-btn" onClick={() => updateTask({ ...selectedTask, isCompleted: !selectedTask.isCompleted })} />
              <span className="detail-title">{selectedTask.taskName}</span>
              <button className="star-btn" onClick={() => updateTask({ ...selectedTask, isImportant: !selectedTask.isImportant })}>
                {selectedTask.isImportant ? "★" : "☆"}
              </button>
            </div>
            
            <div className="detail-card steps">
              {steps.map(step => (
                <div key={step.stepID} className="step-row">
                  <button className={`check-btn ${step.isCompleted ? 'filled' : ''}`} onClick={() => updateStep(step)} />
                  <span className={`step-text ${step.isCompleted ? 'done' : ''}`}>{step.stepText}</span>
                  <button className="delete-step-btn" onClick={() => deleteStep(step.stepID)}>✕</button>
                </div>
              ))}
              <div className="step-row add-step">
                <button className="check-btn" />
                <input className="step-input" placeholder="Adım ekle" value={newStepText} onChange={(e) => setNewStepText(e.target.value)} onKeyDown={addStep} />
              </div>
            </div>

            <div className="detail-card notes-section">
                <div className="notes-list">
                    {notes.map(note => (
                        <div key={note.noteID} className="note-item">
                        <p>{note.noteText}</p>
                        <button className="delete-note-btn" onClick={() => deleteNote(note.noteID)}>✕</button>
                        </div>
                    ))}
                </div>
                <textarea className="detail-note" placeholder="Not ekle..." value={newNoteText} onChange={(e) => setNewNoteText(e.target.value)} />
                <button className="add-note-btn" onClick={addNote}>Not Ekle</button>
            </div>

            <div className="detail-card action">
              📅 Son tarih
              <input type="date" value={selectedTask.dueDate ? new Date(selectedTask.dueDate).toISOString().split('T')[0] : ""} onChange={(e) => updateTask({ ...selectedTask, dueDate: e.target.value })} />
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
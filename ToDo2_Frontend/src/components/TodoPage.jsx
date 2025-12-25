import { useEffect, useState, useCallback, useMemo } from "react";
import api from "../api/axios";
import { useSearch } from "../context/SearchContext.jsx";
import { useAuth } from "../utils/auth";
import { FiStar, FiClock, FiCalendar, FiRepeat, FiFileText, FiTrash2, FiX } from "react-icons/fi";
import "./TodoPage.css";
import reminderService from "../utils/reminderService";

export default function TodoPage({ title, pageType, listId }) {
  const { searchTerm } = useSearch();
  const { user } = useAuth();
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

  // Günlük sıfırlama ve tekrarlayan görevleri ekleme
  const checkAndResetDailyTasks = useCallback(async () => {
    if (!user?.id || pageType !== "gunum") return;
    
    const lastResetDate = localStorage.getItem('lastDailyReset');
    const today = new Date().toDateString();
    
    if (lastResetDate !== today) {
      try {
        // Günlük tekrarlayan görevleri günüme ekle
        const dailyTasksRes = await api.get(`/daily-tasks/${user.id}?includePast=false`);
        const todayDate = new Date().toISOString().split('T')[0];
        const todayDailyTasks = (dailyTasksRes.data || []).filter(dt => {
          if (!dt || !dt.taskDate) return false;
          const taskDate = new Date(dt.taskDate).toISOString().split('T')[0];
          return taskDate === todayDate;
        });

        // Tüm görevleri al
        const allTasksRes = await api.get("/Tasks/list");
        const allTasks = allTasksRes.data || [];
        const todayDateObj = new Date();
        todayDateObj.setHours(0, 0, 0, 0);

        // Her günlük tekrarlayan görev için bugünün görevini oluştur
        for (const dailyTask of todayDailyTasks) {
          try {
            // Ana görevi bul
            const mainTask = allTasks.find(t => t.taskID === dailyTask.taskID);
            
            if (mainTask && mainTask.recurrenceType === 'daily') {
              // Bugün zaten bu görevden oluşturulmuş mu kontrol et
              const existingTask = allTasks.find(t => {
                if (t.taskID === mainTask.taskID) return false; // Ana görev değil
                const createdDate = t.createdAt ? new Date(t.createdAt) : (t.createdDate ? new Date(t.createdDate) : null);
                if (createdDate) {
                  createdDate.setHours(0, 0, 0, 0);
                  return createdDate.getTime() === todayDateObj.getTime() && 
                         t.taskName === mainTask.taskName &&
                         t.recurrenceType !== 'daily'; // Tekrarlayan olmayan görev
                }
                return false;
              });
              
              if (!existingTask) {
                // Yeni görev oluştur (günlük tekrar için)
                await api.post("/Tasks/add", {
                  taskName: mainTask.taskName,
                  taskContent: mainTask.taskContent,
                  dueDate: new Date().toISOString(),
                  isImportant: mainTask.isImportant,
                  recurrenceType: "none" // Yeni görev tekrarlayan değil
                });
              }
            }
          } catch (error) {
            console.error("Failed to add daily recurring task:", error);
          }
        }

        // Sıfırlama tarihini güncelle
        localStorage.setItem('lastDailyReset', today);
        
        // Görevleri yeniden yükle
        loadTasks();
      } catch (error) {
        console.error("Failed to reset daily tasks:", error);
      }
    }
  }, [user?.id, pageType, loadTasks]);

  useEffect(() => {
    loadTasks();
    loadLists();
  }, [loadTasks, loadLists]);

  // Günüm sayfası için günlük sıfırlama ve tekrarlayan görevleri ekleme
  useEffect(() => {
    if (pageType === "gunum" && user?.id) {
      checkAndResetDailyTasks();
    }
  }, [pageType, user?.id, checkAndResetDailyTasks]);

  useEffect(() => {
    if (selectedTask?.taskID) {
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
  }, [selectedTask?.taskID, loadSteps, loadNotes]);

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

  // Aktif görevler değiştiğinde adım sayılarını yükle (optimize edilmiş)
  const activeTaskIds = useMemo(() => tasks.map(t => t.taskID), [tasks]);
  
  useEffect(() => {
    activeTaskIds.forEach(taskId => {
      if (taskSteps[taskId] === undefined) {
        loadStepsForTask(taskId);
      }
    });
  }, [activeTaskIds, taskSteps, loadStepsForTask]);

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
    
    try {
      await api.post("/Tasks/add", { 
        taskName: newTask, 
        listID: listToAdd,
        recurrenceType: "none"
      });
      setNewTask("");
      await loadTasks();
    } catch (error) {
      console.error("Failed to add task:", error);
      alert("Görev eklenirken bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  const updateTask = async (task, updates = {}) => {
    if (!task || !task.taskID) return;
    try {
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
      
      // Eğer reminderDate değiştiyse, bildirim geçmişini temizle
      if (updates.reminderDate !== undefined) {
        reminderService.clearNotification(task.taskID);
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      const errorMessage = error.response?.data?.message || "Görev güncellenirken bir hata oluştu.";
      alert(errorMessage);
    }
  };
  
  const addStep = async (e) => {
    if (e.key !== "Enter" || !newStepText.trim() || !selectedTask) return;
    e.preventDefault(); // Form submit'i engelle
    e.stopPropagation(); // Event propagation'ı durdur
    try {
    await api.post('/Step/add', { taskID: selectedTask.taskID, stepText: newStepText });
    setNewStepText("");
      await loadSteps(selectedTask.taskID);
      // Adım eklendikten sonra bölümü açık tut
      setShowStepsSection(true);
    } catch (error) {
      console.error("Failed to add step:", error);
      alert("Adım eklenirken bir hata oluştu.");
    }
  };

  const updateStep = async (step, updates = {}) => {
    try {
      // isCompleted değeri belirtilmişse onu kullan, yoksa mevcut değerin tersini al
      const newIsCompleted = updates.isCompleted !== undefined 
        ? updates.isCompleted 
        : !step.isCompleted;
      
      await api.put('/Step/update', { 
        stepID: step.stepID, 
        taskID: step.taskID,
        stepText: updates.stepText !== undefined ? updates.stepText : step.stepText,
        isCompleted: newIsCompleted
      });
      await loadSteps(selectedTask.taskID);
      
      // Eğer adım tamamlandıysa ve ayar açıksa, görevi kontrol et
      if (newIsCompleted === true) {
        const autoCompleteEnabled = localStorage.getItem('autoCompleteTaskWhenStepsDone') !== 'false';
        if (autoCompleteEnabled && selectedTask) {
          // Tüm adımları kontrol et
          const updatedSteps = await api.get(`/Steps/task/${selectedTask.taskID}`);
          const allStepsCompleted = updatedSteps.data.every(s => s.isCompleted === true);
          const hasSteps = updatedSteps.data.length > 0;
          
          if (hasSteps && allStepsCompleted && !selectedTask.isCompleted) {
            // Backend'de stored procedure'ü çağır
            try {
              await api.post(`/Tasks/recalculate-completion/${selectedTask.taskID}`);
              // Görevleri yeniden yükle
              await loadTasks();
              // Seçili görevi güncelle - tüm görevlerden bul
              const allTasksRes = await api.get("/Tasks/list");
              const updatedTask = allTasksRes.data.find(t => t.taskID === selectedTask.taskID);
              if (updatedTask) {
                setSelectedTask(updatedTask);
              }
            } catch (error) {
              console.error("Failed to auto-complete task:", error);
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to update step:", error);
      alert("Adım güncellenirken bir hata oluştu.");
    }
  };

  const deleteStep = async (stepId) => {
    try {
      await api.delete(`/Step/delete/${stepId}`);
      await loadSteps(selectedTask.taskID);
    } catch (error) {
      console.error("Failed to delete step:", error);
      alert("Adım silinirken bir hata oluştu.");
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
    if (!newNoteText.trim() || !selectedTask) return;
    try {
    await api.post('/Notes/add', { taskID: selectedTask.taskID, noteText: newNoteText });
    setNewNoteText("");
      await loadNotes(selectedTask.taskID);
      // Not eklendikten sonra bölümü açık tut
      setShowNotesSection(true);
    } catch (error) {
      console.error("Failed to add note:", error);
      alert("Not eklenirken bir hata oluştu.");
    }
  };

  const deleteNote = async (noteId) => {
    if (!selectedTask) return;
    if (!window.confirm("Bu notu silmek istediğinize emin misiniz?")) {
      return;
    }
    try {
      await api.delete(`/Notes/delete/${noteId}`);
      await loadNotes(selectedTask.taskID);
    } catch (error) {
      console.error("Failed to delete note:", error);
      alert("Not silinirken bir hata oluştu.");
    }
  };

  const updateNote = async (note) => {
    try {
      await api.put('/Notes/update', { 
        noteID: note.noteID, 
        taskID: note.taskID,
        noteText: editingNoteText 
      });
      setEditingNoteId(null);
      setEditingNoteText("");
      await loadNotes(selectedTask.taskID);
    } catch (error) {
      console.error("Failed to update note:", error);
      alert("Not güncellenirken bir hata oluştu.");
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
        // isCompleted değeri belirtilmişse onu kullan, yoksa mevcut değerin tersini al
        const newIsCompleted = updates.isCompleted !== undefined 
          ? updates.isCompleted 
          : !step.isCompleted;
        
        await api.put("/Steps/update", {
          stepID: step.stepID,
          stepText: updates.stepText !== undefined ? updates.stepText : step.stepText,
          isCompleted: newIsCompleted
        });
        onStepsChange();
        
        // Eğer adım tamamlandıysa ve ayar açıksa, görevi kontrol et
        if (newIsCompleted === true) {
          const autoCompleteEnabled = localStorage.getItem('autoCompleteTaskWhenStepsDone') !== 'false';
          if (autoCompleteEnabled) {
            // Adımları yeniden yükle ve kontrol et
            const updatedStepsRes = await api.get(`/Steps/task/${taskId}`);
            const updatedSteps = updatedStepsRes.data || [];
            const allStepsCompleted = updatedSteps.length > 0 && updatedSteps.every(s => s.isCompleted === true);
            
            if (allStepsCompleted) {
              // Görevi bul ve kontrol et
              const taskRes = await api.get("/Tasks/list");
              const task = taskRes.data.find(t => t.taskID === taskId);
              if (task && !task.isCompleted) {
                // Backend'de stored procedure'ü çağır
                try {
                  await api.post(`/Tasks/recalculate-completion/${taskId}`);
                  // Görevleri yeniden yükle
                  await loadTasks();
                } catch (error) {
                  console.error("Failed to auto-complete task:", error);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to update step:", error);
        alert("Adım güncellenirken bir hata oluştu.");
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

  const { active: activeTasks, completed: completedTasks } = useMemo(() => {
    if (searchTerm) return { active: tasks.filter(t => !t.isCompleted), completed: tasks.filter(t => t.isCompleted) };
    if (listId) return { active: tasks.filter(t => !t.isCompleted), completed: tasks.filter(t => t.isCompleted) };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const active = tasks.filter(t => {
      // ÖNEMLİ: Tamamlanmış görevler aktif listesinde gösterilmez
      if (t.isCompleted) return false;
      
      if (pageType === "gunum") {
        // Günüm sayfasında sadece bugün oluşturulmuş TAMAMLANMAMIŞ görevleri göster
        const createdDate = t.createdAt ? new Date(t.createdAt) : (t.createdDate ? new Date(t.createdDate) : null);
        if (createdDate) {
          // Geçersiz tarih kontrolü
          if (isNaN(createdDate.getTime())) {
            return false;
          }
          createdDate.setHours(0, 0, 0, 0);
          // Sadece bugün oluşturulmuş görevler (bugünden önce oluşturulmuşlar geçmişe gider)
          return createdDate.getTime() === today.getTime();
        }
        // Tarih bilgisi yoksa bugün oluşturulmuş kabul et (varsayılan)
        return true;
      }
      if (pageType === "onemli") {
        // Önemli sayfasında tüm önemli görevleri göster (günüm'den de dahil)
        return t.isImportant;
      }
      if (pageType === "planlanan") return t.dueDate;
      return true; // Diğer sayfalarda tüm tamamlanmamış görevler
    });
    // Tamamlanan görevler - Sadece gerçekten tamamlanmış görevleri göster
    const completed = tasks.filter(t => {
      // ÖNEMLİ: Sadece isCompleted === true olan görevler tamamlanan listesinde gösterilir
      if (!t.isCompleted) return false;
      
      if (pageType === "onemli") return false; // Önemli sayfasında tamamlanan görevleri gösterme
      if (pageType === "gunum") {
        // Günüm sayfasında sadece bugün oluşturulmuş tamamlanan görevleri göster
        const createdDate = t.createdAt ? new Date(t.createdAt) : (t.createdDate ? new Date(t.createdDate) : null);
        if (createdDate) {
          // Geçersiz tarih kontrolü
          if (isNaN(createdDate.getTime())) {
            return false;
          }
          createdDate.setHours(0, 0, 0, 0);
          return createdDate.getTime() === today.getTime();
        }
        return true; // Tarih bilgisi yoksa bugün oluşturulmuş kabul et
      }
      return true; // Diğer sayfalarda tüm tamamlanmış görevler
    });
    return { active, completed };
  }, [tasks, searchTerm, listId, pageType]);
  const [showCompleted, setShowCompleted] = useState(() => {
    return localStorage.getItem('showCompletedTasks') !== 'false';
  });

  useEffect(() => {
    const stored = localStorage.getItem('showCompletedTasks');
    setShowCompleted(stored !== 'false');
  }, []);

  if (loading) return <div className="loading-full-page">Yükleniyor...</div>;

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
                  <div className="task-row" onClick={(e) => {
                    // Sadece task row'un kendisine tıklandığında aç (butonlara tıklanınca açılmasın)
                    if (e.target.closest('.check-btn, .star-btn, .expand-steps-btn')) {
                      return;
                    }
                    // Çift tıklama ile açılmasını sağla veya tek tıklama ile aç
                    setSelectedTask(task);
                    if (!taskSteps[task.taskID]) {
                      loadStepsForTask(task.taskID);
                    }
                  }}>
                    <button 
                      className={`check-btn ${task.isCompleted ? "filled" : ""}`} 
                      onClick={async (e) => { 
                        e.stopPropagation(); 
                        try {
                          await updateTask({ ...task, isCompleted: !task.isCompleted }); 
                        } catch (error) {
                          console.error("Failed to update task:", error);
                        }
                      }} 
                    />
                    <span className="task-name" onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTask(task);
                      if (!taskSteps[task.taskID]) {
                        loadStepsForTask(task.taskID);
                      }
                    }}>{task.taskName}</span>
                    <button 
                      className="expand-steps-btn"
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                        if (taskSteps[task.taskID] === undefined) {
                            await loadStepsForTask(task.taskID);
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
                        } catch (error) {
                          console.error("Failed to load steps:", error);
                        }
                      }}
                      title={isExpanded ? "Adımları gizle" : "Adımları göster"}
                    >
                      {isExpanded ? "▼" : "▶"} {taskStepsList.length > 0 ? taskStepsList.length : ""}
                    </button>
                    <button 
                      className={`star-btn ${task.isImportant ? "important" : ""}`} 
                      onClick={async (e) => { 
                        e.stopPropagation(); 
                        try {
                          await updateTask({ ...task, isImportant: !task.isImportant }); 
                        } catch (error) {
                          console.error("Failed to update task:", error);
                        }
                      }}
                    >
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
                onClick={async () => {
                  if (window.confirm('Bu görevi silmek istediğinize emin misiniz?')) {
                    try {
                      await api.delete(`/Tasks/delete/${selectedTask.taskID}`);
                      setSelectedTask(null);
                      await loadTasks();
                      alert("Görev başarıyla silindi.");
                    } catch (error) {
                      console.error("Failed to delete task:", error);
                      alert("Görev silinirken bir hata oluştu.");
                    }
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
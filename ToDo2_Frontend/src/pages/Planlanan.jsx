import { useEffect, useState, useCallback, useMemo } from "react";
import api from "../api/axios";
import { useAuth } from "../utils/auth";
import { FiCalendar, FiClock, FiList, FiRepeat, FiX, FiTrash2, FiEdit, FiFileText, FiCheck, FiMinus, FiPlus } from "react-icons/fi";
import "./Planlanan.css";
import reminderService from "../utils/reminderService";

export default function Planlanan() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("planned"); // planned, daily, weekly, monthly
  const [tasks, setTasks] = useState([]);
  const [dailyTasks, setDailyTasks] = useState([]);
  const [weeklyTasks, setWeeklyTasks] = useState([]);
  const [monthlyTasks, setMonthlyTasks] = useState([]);
  const [allPlans, setAllPlans] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [taskHistory, setTaskHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Steps ve Notes state'leri
  const [steps, setSteps] = useState([]);
  const [newStepText, setNewStepText] = useState("");
  const [notes, setNotes] = useState([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [editingStepId, setEditingStepId] = useState(null);
  const [editingStepText, setEditingStepText] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState("");
  const [taskSteps, setTaskSteps] = useState({});
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  const [showStepsSection, setShowStepsSection] = useState(false);
  const [showNotesSection, setShowNotesSection] = useState(false);

  const loadTasks = useCallback(async () => {
    try {
      const res = await api.get("/Tasks/list");
      setTasks(res.data || []);
    } catch (error) {
      console.error("Failed to load tasks:", error);
      setTasks([]);
    }
  }, []);

  const loadDailyTasks = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/daily-tasks/${user.id}`);
      setDailyTasks(res.data || []);
    } catch (error) {
      console.error("Failed to load daily tasks:", error);
      setDailyTasks([]);
    }
  }, [user?.id]);

  const loadWeeklyTasks = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/weekly-tasks/${user.id}`);
      setWeeklyTasks(res.data || []);
    } catch (error) {
      console.error("Failed to load weekly tasks:", error);
      setWeeklyTasks([]);
    }
  }, [user?.id]);

  const loadMonthlyTasks = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/monthly-tasks/${user.id}`);
      setMonthlyTasks(res.data || []);
    } catch (error) {
      console.error("Failed to load monthly tasks:", error);
      setMonthlyTasks([]);
    }
  }, [user?.id]);

  const loadAllPlans = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await api.get("/plans");
      setAllPlans(res.data || []);
    } catch (error) {
      console.error("Failed to load all plans:", error);
      setAllPlans([]);
    }
  }, [user?.id]);

  // Verileri yeniden yükleme fonksiyonu - Tüm load fonksiyonlarından sonra tanımlanmalı
  const refreshAllData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      await Promise.all([
        loadTasks(),
        loadDailyTasks(),
        loadWeeklyTasks(),
        loadMonthlyTasks(),
        loadAllPlans()
      ]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, loadTasks, loadDailyTasks, loadWeeklyTasks, loadMonthlyTasks, loadAllPlans]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      loadTasks(),
      loadDailyTasks(),
      loadWeeklyTasks(),
      loadMonthlyTasks(),
      loadAllPlans()
    ]).then(() => {
      setLoading(false);
    });
  }, [loadTasks, loadDailyTasks, loadWeeklyTasks, loadMonthlyTasks, loadAllPlans]);

  // Sayfa görünür olduğunda verileri yenile (diğer sayfalardan dönünce)
  useEffect(() => {
    if (!refreshAllData) return;
    const handleFocus = () => {
      refreshAllData();
    };
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshAllData();
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshAllData]);

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
      setNotes(res.data || []);
    } catch (error) {
      console.error("Failed to load notes:", error);
      setNotes([]);
    }
  }, []);

  const loadTaskHistory = useCallback(async (task) => {
    if (!task) return;
    
    try {
      const history = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Ana görevin tamamlanma tarihini al
      const mainTask = tasks.find(t => t.taskID === task.taskID);
      const taskCompletedDate = mainTask?.completedDate ? new Date(mainTask.completedDate) : null;
      
      if (task.recurrenceType === 'daily') {
        // Günlük görevler için tüm planlanan tarihleri al (geçmiş ve gelecek)
        const allDaily = await api.get(`/daily-tasks/${user.id}?includePast=true`);
        const taskDaily = (allDaily.data || []).filter(dt => dt.taskID === task.taskID);
        
        taskDaily.forEach(dt => {
          const planDate = new Date(dt.taskDate);
          planDate.setHours(0, 0, 0, 0);
          
          if (planDate < today) {
            // Geçmiş tarihler - bu tarihte tamamlanmış mı kontrol et
            const completed = dt.completedAt && new Date(dt.completedAt).toDateString() === planDate.toDateString();
            history.push({
              date: planDate,
              completed: completed,
              type: 'daily'
            });
          }
        });
      } else if (task.recurrenceType === 'weekly') {
        // Haftalık görevler için tüm planlanan haftaları al (geçmiş ve gelecek)
        const allWeekly = await api.get(`/weekly-tasks/${user.id}?includePast=true`);
        const taskWeekly = (allWeekly.data || []).filter(wt => {
          const taskId = wt.taskId || wt.taskID;
          return taskId === task.taskID;
        });
        
        taskWeekly.forEach(wt => {
          const weekStart = new Date(wt.weekStartDate);
          weekStart.setHours(0, 0, 0, 0);
          
          if (weekStart < today) {
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            
            // Bu hafta içinde tamamlanmış mı kontrol et
            const completed = wt.completedAt && 
              new Date(wt.completedAt) >= weekStart && 
              new Date(wt.completedAt) <= weekEnd;
            
            history.push({
              weekStart: weekStart,
              weekEnd: weekEnd,
              completed: completed,
              type: 'weekly'
            });
          }
        });
      } else if (task.recurrenceType === 'monthly') {
        // Aylık görevler için tüm planlanan ayları al (geçmiş ve gelecek)
        const allMonthly = await api.get(`/monthly-tasks/${user.id}?includePast=true`);
        const taskMonthly = (allMonthly.data || []).filter(mt => {
          const taskId = mt.taskId || mt.taskID;
          return taskId === task.taskID;
        });
        
        taskMonthly.forEach(mt => {
          const monthDate = new Date(mt.monthDate || mt.monthStartDate);
          monthDate.setHours(0, 0, 0, 0);
          
          if (monthDate < today) {
            // Bu ay içinde tamamlanmış mı kontrol et
            const completed = mt.completedAt && 
              new Date(mt.completedAt).getMonth() === monthDate.getMonth() &&
              new Date(mt.completedAt).getFullYear() === monthDate.getFullYear();
            
            history.push({
              month: monthDate,
              completed: completed,
              type: 'monthly'
            });
          }
        });
      }
      
      setTaskHistory(history.sort((a, b) => {
        const dateA = a.date || a.weekStart || a.month;
        const dateB = b.date || b.weekStart || b.month;
        return dateB - dateA; // En yeni önce
      }));
    } catch (error) {
      console.error("Failed to load task history:", error);
      setTaskHistory([]);
    }
  }, [user?.id, tasks]);

  useEffect(() => {
    if (selectedTask) {
      loadSteps(selectedTask.taskID);
      loadNotes(selectedTask.taskID);
    }
  }, [selectedTask, loadSteps, loadNotes]);

  const updateTask = async (task, updates = {}) => {
    if (!task || !task.taskID) return;
    try {
      const updatedTask = { 
        ...task, 
        taskID: task.taskID,
        ...updates
      };
      await api.put("/Tasks/update", updatedTask);
      
      // Eğer recurrenceType değiştiyse, tüm verileri yeniden yükle
      const recurrenceChanged = updates.recurrenceType !== undefined && updates.recurrenceType !== task.recurrenceType;
      
      // Verileri yenile
      await refreshAllData();
      
      // Seçili görevi güncelle - önce tüm görevlerden güncel halini bul
      if (selectedTask && selectedTask.taskID === task.taskID) {
        // Tüm görevlerden güncel görevi bul
        const allTasksRes = await api.get("/Tasks/list");
        const updatedTaskFromServer = allTasksRes.data.find(t => t.taskID === task.taskID);
        if (updatedTaskFromServer) {
          setSelectedTask(updatedTaskFromServer);
        } else {
          // Eğer bulunamazsa, local state'i güncelle
          setSelectedTask({ ...selectedTask, ...updates });
        }
      }
      
      // Eğer reminderDate değiştiyse, bildirim geçmişini temizle
      if (updates.reminderDate !== undefined) {
        reminderService.clearNotification(task.taskID);
      }
      
      // Eğer recurrenceType değiştiyse, kullanıcıya bilgi ver
      if (recurrenceChanged) {
        const recurrenceTypeName = updates.recurrenceType === 'daily' ? 'Günlük' 
          : updates.recurrenceType === 'weekly' ? 'Haftalık'
          : updates.recurrenceType === 'monthly' ? 'Aylık'
          : 'Tekrarlama Yok';
        // Otomatik olarak ilgili sekmeye geç
        if (updates.recurrenceType === 'daily') {
          setActiveTab('daily');
        } else if (updates.recurrenceType === 'weekly') {
          setActiveTab('weekly');
        } else if (updates.recurrenceType === 'monthly') {
          setActiveTab('monthly');
        } else {
          setActiveTab('planned');
        }
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      throw error;
    }
  };

  const deleteTask = async (taskId) => {
    if (window.confirm("Bu görevi silmek istediğinize emin misiniz?")) {
      try {
        await api.delete(`/Tasks/delete/${taskId}`);
        await refreshAllData();
        if (selectedTask && selectedTask.taskID === taskId) {
          setSelectedTask(null);
        }
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    }
  };

  // Tekrarlayan göreve manuel olarak yeni bir instance ekle
  const addRecurringInstance = async (task, date) => {
    if (!task.recurrenceType || task.recurrenceType === 'none') {
      return;
    }

    try {
      if (task.recurrenceType === 'daily') {
        const dateStr = date.toISOString().split('T')[0];
        await api.post(`/daily-tasks?taskId=${task.taskID}&date=${dateStr}`);
      } else if (task.recurrenceType === 'weekly') {
        // Haftanın başlangıç gününü hesapla (Pazartesi)
        const weekStart = new Date(date);
        const dayOfWeek = weekStart.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Pazartesi'ye getir
        weekStart.setDate(weekStart.getDate() + diff);
        weekStart.setHours(0, 0, 0, 0);
        
        const weekStartStr = weekStart.toISOString().split('T')[0];
        await api.post(`/weekly-tasks?taskId=${task.taskID}&weekStart=${weekStartStr}`);
      } else if (task.recurrenceType === 'monthly') {
        // Ayın ilk günü
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthStartStr = monthStart.toISOString().split('T')[0];
        
        await api.post(`/monthly-tasks?taskId=${task.taskID}&monthDate=${monthStartStr}`);
      }
      
      await refreshAllData();
      alert("Görev tekrarı başarıyla eklendi.");
    } catch (error) {
      console.error("Failed to add recurring instance:", error);
      alert("Görev tekrarı eklenirken bir hata oluştu.");
    }
  };

  // Tekrarlayan görevden belirli bir instance'ı kaldır
  const removeRecurringInstance = async (task) => {
    if (!task.recurrenceType || task.recurrenceType === 'none') {
      return;
    }

    let confirmMessage = "";
    let instanceInfo = "";
    
    if (task.recurrenceType === 'daily' && task.dailyTaskId) {
      const date = task.taskDate || task.planDate;
      instanceInfo = date ? new Date(date).toLocaleDateString('tr-TR') : 'bu gün';
      confirmMessage = `Bu görevi ${instanceInfo} için kaldırmak istediğinize emin misiniz? (Ana görev silinmeyecek, sadece bu gün için kaldırılacak)`;
    } else if (task.recurrenceType === 'weekly' && task.weeklyTaskId) {
      const weekStart = task.weekStartDate;
      if (weekStart) {
        const startDate = new Date(weekStart);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        instanceInfo = `${startDate.toLocaleDateString('tr-TR')} - ${endDate.toLocaleDateString('tr-TR')}`;
      } else {
        instanceInfo = 'bu hafta';
      }
      confirmMessage = `Bu görevi ${instanceInfo} haftası için kaldırmak istediğinize emin misiniz? (Ana görev silinmeyecek, sadece bu hafta için kaldırılacak)`;
    } else if (task.recurrenceType === 'monthly' && task.monthlyTaskId) {
      const monthDate = task.monthDate;
      instanceInfo = monthDate ? new Date(monthDate).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }) : 'bu ay';
      confirmMessage = `Bu görevi ${instanceInfo} için kaldırmak istediğinize emin misiniz? (Ana görev silinmeyecek, sadece bu ay için kaldırılacak)`;
    } else {
      alert("Bu görev tekrarı kaldırılamaz.");
      return;
    }

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      if (task.recurrenceType === 'daily' && task.dailyTaskId) {
        await api.delete(`/daily-tasks/${task.dailyTaskId}`);
      } else if (task.recurrenceType === 'weekly' && task.weeklyTaskId) {
        await api.delete(`/weekly-tasks/${task.weeklyTaskId}`);
      } else if (task.recurrenceType === 'monthly' && task.monthlyTaskId) {
        await api.delete(`/monthly-tasks/${task.monthlyTaskId}`);
      }
      
      await refreshAllData();
      alert("Görev tekrarı başarıyla kaldırıldı.");
    } catch (error) {
      console.error("Failed to remove recurring instance:", error);
      alert("Görev tekrarı kaldırılırken bir hata oluştu.");
    }
  };

  const addStep = async (e) => {
    if (e.key !== "Enter" || !newStepText.trim() || !selectedTask) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.post('/Step/add', { taskID: selectedTask.taskID, stepText: newStepText });
      setNewStepText("");
      await loadSteps(selectedTask.taskID);
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
          const updatedStepsRes = await api.get(`/Steps/task/${selectedTask.taskID}`);
          const updatedSteps = updatedStepsRes.data || [];
          const allStepsCompleted = updatedSteps.length > 0 && updatedSteps.every(s => s.isCompleted === true);
          
          if (allStepsCompleted && !selectedTask.isCompleted) {
            // Backend'de stored procedure'ü çağır
            try {
              await api.post(`/Tasks/recalculate-completion/${selectedTask.taskID}`);
              // Görevleri yeniden yükle
              await refreshAllData();
              // Seçili görevi güncelle
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

  const addNote = async () => {
    if (!newNoteText.trim() || !selectedTask) return;
    try {
      await api.post('/Notes/add', { taskID: selectedTask.taskID, noteText: newNoteText });
      setNewNoteText("");
      await loadNotes(selectedTask.taskID);
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

  // Görevleri kategorilere ayır
  const { plannedTasks, dailyRecurringTasks, weeklyRecurringTasks, monthlyRecurringTasks } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const planned = [];
    const daily = [];
    const weekly = [];
    const monthly = [];
    const recurringTaskIds = new Set();

    // Günlük tekrarlayan görevler - Sadece gelecek tarihleri göster
    dailyTasks.forEach(task => {
      if (task && !task.isCompleted) {
        const mainTask = tasks.find(t => t.taskID === task.taskID);
        if (mainTask && mainTask.recurrenceType === 'daily') {
          const taskDate = new Date(task.taskDate || task.taskDate);
          taskDate.setHours(0, 0, 0, 0);
          
          // Sadece bugün ve gelecek tarihleri göster
          if (taskDate >= today) {
            recurringTaskIds.add(mainTask.taskID);
            daily.push({
              ...mainTask,
              dailyTaskId: task.dailyTaskId || task.dailyTaskID,
              taskDate: task.taskDate,
              recurrenceType: 'daily'
            });
          }
        }
      }
    });
    
    // Haftalık tekrarlayan görevler
    weeklyTasks.forEach(task => {
      if (task && !task.isCompleted) {
        const taskId = task.taskId || task.taskID;
        const mainTask = tasks.find(t => t.taskID === taskId);
        // Sadece recurrenceType'ı 'weekly' olan görevleri ekle
        if (mainTask && mainTask.recurrenceType === 'weekly' && !recurringTaskIds.has(mainTask.taskID)) {
          recurringTaskIds.add(mainTask.taskID);
          weekly.push({
            ...mainTask,
            weeklyTaskId: task.weeklyTaskId || task.weeklyTaskID,
            weekStartDate: task.weekStartDate,
            recurrenceType: 'weekly'
          });
        }
      }
    });
    
    // Aylık tekrarlayan görevler
    monthlyTasks.forEach(task => {
      if (task && !task.isCompleted) {
        const taskId = task.taskId || task.taskID;
        const mainTask = tasks.find(t => t.taskID === taskId);
        // Sadece recurrenceType'ı 'monthly' olan görevleri ekle
        if (mainTask && mainTask.recurrenceType === 'monthly' && !recurringTaskIds.has(mainTask.taskID)) {
          recurringTaskIds.add(mainTask.taskID);
          monthly.push({
            ...mainTask,
            monthlyTaskId: task.monthlyTaskId || task.monthlyTaskID,
            monthDate: task.monthDate,
            recurrenceType: 'monthly'
          });
        }
      }
    });

    // Planlanan görevler (dueDate olan normal görevler, tekrarlayan olmayan)
    tasks.forEach(task => {
      if (task.isCompleted) return;
      if (!task.dueDate) return;
      // Tekrarlayan görevleri planlanan listesine ekleme
      if (task.recurrenceType && task.recurrenceType !== 'none') return;
      if (recurringTaskIds.has(task.taskID)) return;
      
      planned.push(task);
    });
    
    // Ayrıca, tasks listesinden doğrudan recurrenceType'a göre de kontrol et
    // (Eğer planlar henüz oluşturulmamışsa veya yeni eklenmişse)
    tasks.forEach(task => {
      if (task.isCompleted) return;
      if (!task.recurrenceType || task.recurrenceType === 'none') return;
      if (recurringTaskIds.has(task.taskID)) return;
      
      // Eğer görev tekrarlayan ama henüz planlarda yoksa, ekle
      if (task.recurrenceType === 'daily') {
        recurringTaskIds.add(task.taskID);
        daily.push({
          ...task,
          recurrenceType: 'daily'
        });
      } else if (task.recurrenceType === 'weekly') {
        recurringTaskIds.add(task.taskID);
        weekly.push({
          ...task,
          recurrenceType: 'weekly'
        });
      } else if (task.recurrenceType === 'monthly') {
        recurringTaskIds.add(task.taskID);
        monthly.push({
          ...task,
          recurrenceType: 'monthly'
        });
      }
    });

    return { 
      plannedTasks: planned, 
      dailyRecurringTasks: daily, 
      weeklyRecurringTasks: weekly, 
      monthlyRecurringTasks: monthly 
    };
  }, [tasks, dailyTasks, weeklyTasks, monthlyTasks]);

  const getDisplayTasks = () => {
    switch (activeTab) {
      case "planned":
        return plannedTasks;
      case "daily":
        return dailyRecurringTasks;
      case "weekly":
        return weeklyRecurringTasks;
      case "monthly":
        return monthlyRecurringTasks;
      case "all-plans":
        // Plans View'dan gelen verileri görev formatına dönüştür
        return (allPlans || []).map(plan => {
          const mainTask = tasks.find(t => t.taskID === plan.taskId);
          if (!mainTask) return null;
          return {
            ...mainTask,
            planType: plan.planType,
            planDate: plan.planDate,
            planID: plan.planID,
            taskName: plan.taskName || mainTask?.taskName || "Bilinmeyen Görev"
          };
        }).filter(task => task && task.taskID && !task.isCompleted);
      default:
        return [];
    }
  };

  const displayTasks = getDisplayTasks();

  const handleEditClick = async (task) => {
    setSelectedTask(task);
    if (task.recurrenceType && task.recurrenceType !== 'none') {
      await loadTaskHistory(task);
      setShowHistory(true);
    }
  };

  if (loading) return <div className="loading-full-page">Yükleniyor...</div>;

  return (
    <div className="todo-layout planned-page">
      <header className="page-header">
        <h1 className="page-title">Planlanan</h1>
      </header>

      <div className="planned-tabs">
        <button
          className={`planned-tab ${activeTab === "planned" ? "active" : ""}`}
          onClick={() => setActiveTab("planned")}
        >
          <FiCalendar style={{ marginRight: '8px' }} />
          Planlanan ({plannedTasks.length})
        </button>
        <button
          className={`planned-tab ${activeTab === "daily" ? "active" : ""}`}
          onClick={() => setActiveTab("daily")}
        >
          <FiClock style={{ marginRight: '8px' }} />
          Günlük Görevler ({dailyRecurringTasks.length})
        </button>
        <button
          className={`planned-tab ${activeTab === "weekly" ? "active" : ""}`}
          onClick={() => setActiveTab("weekly")}
        >
          <FiRepeat style={{ marginRight: '8px' }} />
          Haftalık Görevler ({weeklyRecurringTasks.length})
        </button>
        <button
          className={`planned-tab ${activeTab === "monthly" ? "active" : ""}`}
          onClick={() => setActiveTab("monthly")}
        >
          <FiList style={{ marginRight: '8px' }} />
          Aylık Görevler ({monthlyRecurringTasks.length})
        </button>
        <button
          className={`planned-tab ${activeTab === "all-plans" ? "active" : ""}`}
          onClick={() => setActiveTab("all-plans")}
          title="Tüm planları birleşik görüntüle"
        >
          <FiCalendar style={{ marginRight: '8px' }} />
          Tüm Planlar ({(allPlans || []).length})
        </button>
      </div>

      <div className="planned-content">
        {displayTasks.length === 0 ? (
          <div className="empty-state">
            <p>Henüz görev yok.</p>
          </div>
        ) : (
          <div className="task-cards-grid">
            {displayTasks.map(task => {
              const taskStepsList = taskSteps[task.taskID] || [];
              const isRecurring = task.recurrenceType && task.recurrenceType !== 'none';
              
              return (
                <div 
                  key={task.taskID} 
                  className="task-card"
                  data-recurrence={task.recurrenceType || 'none'}
                >
                  <div className="task-card-header">
                    <button 
                      className={`task-card-check ${task.isCompleted ? "completed" : ""}`} 
                      onClick={async (e) => { 
                        e.stopPropagation(); 
                        try {
                          await updateTask({ ...task, isCompleted: !task.isCompleted }); 
                        } catch (error) {
                          console.error("Failed to update task:", error);
                        }
                      }} 
                    >
                      {task.isCompleted ? <FiCheck /> : ''}
                    </button>
                    <h3 className="task-card-title">{task.taskName}</h3>
                    {isRecurring && (
                      <span className="task-card-recurrence">
                        {task.recurrenceType === 'daily' ? '📅 Günlük' : 
                         task.recurrenceType === 'weekly' ? '🔄 Haftalık' : 
                         '📆 Aylık'}
                      </span>
                    )}
                  </div>
                  
                  {task.taskContent && (
                    <p className="task-card-content">{task.taskContent}</p>
                  )}
                  
                  {task.dueDate && (
                    <div className="task-card-date">
                      <FiCalendar style={{ marginRight: '4px', fontSize: '14px' }} />
                      {new Date(task.dueDate).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  )}
                  
                  <div className="task-card-actions">
                    <button
                      className="task-card-action-btn"
                      onClick={() => handleEditClick(task)}
                    >
                      <FiEdit />
                      Düzenle
                    </button>
                    <button
                      className="task-card-action-btn"
                      onClick={async () => {
                        setSelectedTask(task);
                        if (!taskSteps[task.taskID]) {
                          loadStepsForTask(task.taskID);
                        }
                      }}
                    >
                      <FiFileText />
                      Detay
                    </button>
                    {isRecurring && (task.dailyTaskId || task.weeklyTaskId || task.monthlyTaskId) && (
                      <button
                        className="task-card-action-btn remove-instance"
                        onClick={() => removeRecurringInstance(task)}
                        title="Bu tekrarı kaldır (Ana görev silinmez)"
                      >
                        <FiMinus />
                      </button>
                    )}
                    <button
                      className="task-card-action-btn delete"
                      onClick={() => deleteTask(task.taskID)}
                    >
                      <FiTrash2 />
                      Sil
                    </button>
                  </div>
                  
                  {taskStepsList.length > 0 && (
                    <div className="task-card-steps">
                      <span className="task-card-steps-count">
                        {taskStepsList.filter(s => s.isCompleted).length} / {taskStepsList.length} adım tamamlandı
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Task Detail Panel */}
      <aside 
        className={`task-detail ${selectedTask ? "open" : ""}`}
      >
        <button className="close-btn" onClick={() => {
          setSelectedTask(null);
          setShowHistory(false);
        }}>
          <FiX />
        </button>
        {selectedTask && (
          <>
            {!showHistory ? (
              <>
                <div className="detail-card header-card">
                  <input
                    className="detail-title"
                    type="text"
                    value={selectedTask.taskName || ""}
                    onChange={(e) => updateTask(selectedTask, { taskName: e.target.value })}
                    onBlur={() => updateTask(selectedTask)}
                    style={{ border: 'none', background: 'transparent', padding: 0, width: '100%', fontSize: '20px', fontWeight: '600' }}
                  />
                  
                  {/* Recurrence Type Selector */}
                  <div className="recurrence-selector" style={{ marginTop: '16px' }}>
                    <label style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
                      Tekrarlama Tipi:
                    </label>
                    <select
                      value={selectedTask.recurrenceType || 'none'}
                      onChange={async (e) => {
                        const newRecurrenceType = e.target.value === 'none' ? null : e.target.value;
                        try {
                          await updateTask(selectedTask, { 
                            recurrenceType: newRecurrenceType,
                            // Eğer yineleme ekleniyorsa dueDate'i null yap
                            dueDate: newRecurrenceType ? null : selectedTask.dueDate
                          });
                        } catch (error) {
                          console.error("Failed to update recurrence type:", error);
                          alert("Tekrarlama tipi güncellenirken bir hata oluştu.");
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        fontSize: '14px',
                        background: 'var(--background-secondary)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="none">Tekrarlama Yok</option>
                      <option value="daily">Günlük</option>
                      <option value="weekly">Haftalık</option>
                      <option value="monthly">Aylık</option>
                    </select>
                  </div>

                  {/* Manuel Instance Ekleme - Sadece tekrarlayan görevler için */}
                  {selectedTask.recurrenceType && selectedTask.recurrenceType !== 'none' && (
                    <div className="detail-card action" style={{ marginTop: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span className="detail-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <FiPlus style={{ fontSize: '18px', color: 'var(--text-secondary)' }} />
                          <span>Yeni Tekrar Ekle</span>
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="date"
                          id="add-instance-date"
                          style={{
                            flex: 1,
                            padding: '8px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            fontSize: '14px',
                            background: 'var(--background-secondary)',
                            color: 'var(--text-primary)'
                          }}
                        />
                        <button
                          onClick={async () => {
                            const dateInput = document.getElementById('add-instance-date');
                            if (!dateInput || !dateInput.value) {
                              alert('Lütfen bir tarih seçin.');
                              return;
                            }
                            const selectedDate = new Date(dateInput.value);
                            await addRecurringInstance(selectedTask, selectedDate);
                            dateInput.value = '';
                          }}
                          style={{
                            padding: '8px 16px',
                            background: 'var(--accent-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <FiPlus style={{ fontSize: '14px' }} />
                          Ekle
                        </button>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                        {selectedTask.recurrenceType === 'daily' 
                          ? 'Seçilen gün için bu görevi ekleyin.'
                          : selectedTask.recurrenceType === 'weekly'
                          ? 'Seçilen tarihin bulunduğu hafta için bu görevi ekleyin.'
                          : 'Seçilen tarihin bulunduğu ay için bu görevi ekleyin.'}
                      </p>
                    </div>
                  )}

                  {/* Due Date Input - Sadece yineleme yoksa göster */}
                  {(!selectedTask.recurrenceType || selectedTask.recurrenceType === 'none') && (
                    <div style={{ marginTop: '16px' }}>
                      <label style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
                        Son Tarih:
                      </label>
                      <input
                        type="datetime-local"
                        value={selectedTask.dueDate ? new Date(selectedTask.dueDate).toISOString().slice(0, 16) : ''}
                        onChange={(e) => {
                          const newDueDate = e.target.value ? new Date(e.target.value).toISOString() : null;
                          updateTask(selectedTask, { dueDate: newDueDate });
                        }}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          fontSize: '14px',
                          background: 'var(--background-secondary)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                  )}
                </div>

                {selectedTask.recurrenceType && selectedTask.recurrenceType !== 'none' && (
                  <div className="detail-card action" onClick={async () => {
                    await loadTaskHistory(selectedTask);
                    setShowHistory(true);
                  }}>
                    <span className="detail-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiClock />
                      <span>Geçmiş</span>
                    </span>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>▶</span>
                  </div>
                )}

                {/* Steps Section */}
                <div className="detail-card action" onClick={() => {
                  setShowStepsSection(!showStepsSection);
                  if (!showStepsSection) {
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

                {showStepsSection && (
                  <div className="detail-card steps-section">
                    {steps.length > 0 && (
                      <div className="steps">
                        {steps.map(step => (
                          <div key={step.stepID} className="step-item">
                            {editingStepId === step.stepID ? (
                              <div className="step-edit">
                                <input
                                  type="text"
                                  value={editingStepText}
                                  onChange={(e) => setEditingStepText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      updateStep(step, { stepText: editingStepText });
                                      setEditingStepId(null);
                                      setEditingStepText("");
                                    } else if (e.key === 'Escape') {
                                      setEditingStepId(null);
                                      setEditingStepText("");
                                    }
                                  }}
                                  autoFocus
                                />
                              </div>
                            ) : (
                              <>
                                <button 
                                  className={`check-btn ${step.isCompleted ? "filled" : ""}`}
                                  onClick={() => updateStep(step, { isCompleted: !step.isCompleted })}
                                />
                                <span 
                                  className={step.isCompleted ? "step-completed" : ""}
                                  onDoubleClick={() => {
                                    setEditingStepId(step.stepID);
                                    setEditingStepText(step.stepText);
                                  }}
                                >
                                  {step.stepText}
                                </span>
                                <button
                                  className="delete-step-btn"
                                  onClick={() => deleteStep(step.stepID)}
                                >
                                  <FiTrash2 />
                                </button>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="add-step-input">
                      <input
                        className="step-input"
                        type="text"
                        placeholder="Adım ekle..."
                        value={newStepText}
                        onChange={(e) => setNewStepText(e.target.value)}
                        onKeyDown={addStep}
                      />
                    </div>
                  </div>
                )}

                {/* Notes Section */}
                <div className="detail-card action" onClick={() => {
                  setShowNotesSection(!showNotesSection);
                  if (!showNotesSection) {
                    setTimeout(() => {
                      const textarea = document.querySelector('.note-textarea');
                      if (textarea) textarea.focus();
                    }, 100);
                  }
                }}>
                  <span className="detail-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px', fontWeight: '600' }}>+</span>
                    <span>Not ekle</span>
                  </span>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    {showNotesSection ? '▼' : '▶'}
                  </span>
                </div>

                {showNotesSection && (
                  <div className="detail-card notes-section">
                    {notes.length > 0 && (
                      <div className="notes">
                        {notes.map(note => (
                          <div key={note.noteID} className="note-item">
                            {editingNoteId === note.noteID ? (
                              <div className="note-edit">
                                <textarea
                                  value={editingNoteText}
                                  onChange={(e) => setEditingNoteText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Escape') {
                                      setEditingNoteId(null);
                                      setEditingNoteText("");
                                    }
                                  }}
                                  autoFocus
                                />
                                <div className="note-edit-actions">
                                  <button onClick={async () => {
                                    try {
                                      await api.put("/Notes/update", {
                                        noteID: note.noteID,
                                        taskID: note.taskID,
                                        noteText: editingNoteText
                                      });
                                      await loadNotes(selectedTask.taskID);
                                      setEditingNoteId(null);
                                      setEditingNoteText("");
                                    } catch (error) {
                                      console.error("Failed to update note:", error);
                                      alert("Not güncellenirken bir hata oluştu.");
                                    }
                                  }}>Kaydet</button>
                                  <button onClick={() => {
                                    setEditingNoteId(null);
                                    setEditingNoteText("");
                                  }}>İptal</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p onDoubleClick={() => {
                                  setEditingNoteId(note.noteID);
                                  setEditingNoteText(note.noteText);
                                }}>
                                  {note.noteText}
                                </p>
                                <button
                                  className="delete-note-btn"
                                  onClick={() => deleteNote(note.noteID)}
                                >
                                  <FiTrash2 />
                                </button>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="add-note-input">
                      <textarea
                        className="note-textarea"
                        placeholder="Not ekle..."
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        rows={3}
                      />
                      <button onClick={addNote} className="add-note-btn">
                        Ekle
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="history-view">
                <div className="detail-card header-card">
                  <button 
                    className="back-btn"
                    onClick={() => setShowHistory(false)}
                  >
                    ← Geri
                  </button>
                  <h2 className="detail-title">{selectedTask.taskName} - Geçmiş</h2>
                </div>
                
                <div className="history-list">
                  {taskHistory.length === 0 ? (
                    <p className="no-history">Geçmiş kayıt yok.</p>
                  ) : (
                    taskHistory.map((item, idx) => (
                      <div key={idx} className={`history-item ${item.completed ? 'completed' : 'missed'}`}>
                        {item.type === 'daily' && (
                          <div className="history-item-content">
                            <div className="history-date">
                              {item.date.toLocaleDateString('tr-TR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                weekday: 'long'
                              })}
                            </div>
                            <div className="history-status">
                              {item.completed ? (
                                <span className="status-completed">✓ Tamamlandı</span>
                              ) : (
                                <span className="status-missed">✗ Yapılmadı</span>
                              )}
                            </div>
                          </div>
                        )}
                        {item.type === 'weekly' && (
                          <div className="history-item-content">
                            <div className="history-date">
                              {item.weekStart.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} - {item.weekEnd.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                            <div className="history-status">
                              {item.completed ? (
                                <span className="status-completed">✓ Tamamlandı</span>
                              ) : (
                                <span className="status-missed">✗ Yapılmadı</span>
                              )}
                            </div>
                          </div>
                        )}
                        {item.type === 'monthly' && (
                          <div className="history-item-content">
                            <div className="history-date">
                              {item.month.toLocaleDateString('tr-TR', {
                                month: 'long',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="history-status">
                              {item.completed ? (
                                <span className="status-completed">✓ Tamamlandı</span>
                              ) : (
                                <span className="status-missed">✗ Yapılmadı</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </aside>
    </div>
  );
}

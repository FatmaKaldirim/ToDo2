import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import { useAuth } from "../utils/auth";
import "./Gecmis.css";
import { FiClock, FiCalendar, FiStar, FiList } from "react-icons/fi";

export default function Gecmis() {
  const { user } = useAuth();
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // Önceki günlerin görevlerini yükle
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Son 30 günün görevlerini getir
      const tasksRes = await api.get("/Tasks/list");
      const allTasks = tasksRes.data || [];
      
      // Önceki günlere ait tamamlanmış görevleri filtrele
      const history = allTasks
        .filter(task => {
          if (!task.isCompleted) return false;
          const completedDate = task.completedDate ? new Date(task.completedDate) : null;
          if (!completedDate) return false;
          completedDate.setHours(0, 0, 0, 0);
          return completedDate < today;
        })
        .map(task => ({
          ...task,
          date: task.completedDate ? new Date(task.completedDate) : new Date()
        }))
        .sort((a, b) => b.date - a.date);

      // Tarihe göre grupla
      const grouped = history.reduce((acc, task) => {
        const dateKey = task.date.toLocaleDateString('tr-TR');
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(task);
        return acc;
      }, {});

      setHistoryItems(Object.entries(grouped).map(([date, tasks]) => ({
        date,
        dateObj: new Date(tasks[0].date),
        tasks
      })));
    } catch (error) {
      console.error("Failed to load history:", error);
      setHistoryItems([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const formatDateLabel = (dateObj) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    dateObj.setHours(0, 0, 0, 0);
    
    if (dateObj.getTime() === yesterday.getTime()) {
      return "Dün";
    }
    
    return dateObj.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  if (loading) return <div className="loading-full-page">Yükleniyor...</div>;

  return (
    <div className="todo-layout">
      <header className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FiClock style={{ fontSize: '24px', color: '#7c3aed' }} />
          <h1 className="page-title">Geçmiş</h1>
        </div>
      </header>

      <div className="todo-list-container history-container">
        {historyItems.length === 0 ? (
          <div className="no-history-message">
            <FiClock style={{ fontSize: '48px', color: '#d1d5db', marginBottom: '16px' }} />
            <p>Henüz geçmiş görev yok.</p>
          </div>
        ) : (
          <div className="history-timeline">
            {historyItems.map((group, idx) => (
              <div key={idx} className="history-day-group">
                <div className="history-date-header">
                  <div className="history-date-line"></div>
                  <span className="history-date-label">{formatDateLabel(group.dateObj)}</span>
                  <div className="history-date-line"></div>
                </div>
                <div className="history-tasks">
                  {group.tasks.map(task => (
                    <div key={task.taskID} className="history-task-item">
                      <div className="history-task-icon">
                        {task.isImportant ? (
                          <FiStar style={{ color: '#fbbf24' }} />
                        ) : (
                          <FiList style={{ color: '#9ca3af' }} />
                        )}
                      </div>
                      <div className="history-task-content">
                        <span className="history-task-name">{task.taskName}</span>
                        {task.listName && (
                          <span className="history-task-list">{task.listName}</span>
                        )}
                      </div>
                      <div className="history-task-time">
                        {new Date(task.completedDate).toLocaleTimeString('tr-TR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


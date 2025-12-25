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
      const now = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Son 30 günün görevlerini getir
      const tasksRes = await api.get("/Tasks/list");
      const allTasks = tasksRes.data || [];
      
      // Önceki günlere ait görevleri filtrele (tamamlanmış veya tamamlanmamış, bugünden önce oluşturulmuş)
      // ÖNEMLİ: Bir görevin arşive gitmesi için saatin 00:00'ı geçip o günün bitmiş olması gerekir
      // Yani bugün oluşturulmuş görevler (saat kaç olursa olsun) arşive GİTMEZ
      const history = allTasks
        .filter(task => {
          // Backend'den CreatedAt olarak geliyor, frontend'de createdAt olarak map ediliyor
          const createdDate = task.createdAt ? new Date(task.createdAt) : (task.createdDate ? new Date(task.createdDate) : null);
          if (createdDate) {
            // Geçersiz tarih kontrolü
            if (isNaN(createdDate.getTime())) {
              return false;
            }
            createdDate.setHours(0, 0, 0, 0);
            // Bugünden ÖNCE oluşturulmuş görevler (tamamlanmış veya tamamlanmamış) - hepsi geçmişe gider
            // Bugün veya gelecekte oluşturulmuş görevler arşive GİTMEZ
            return createdDate.getTime() < today.getTime();
          }
          // Eğer createdDate yoksa ve görev tamamlanmışsa, tamamlanma tarihine bak
          if (task.isCompleted) {
            const completedDate = task.completedAt ? new Date(task.completedAt) : (task.completedDate ? new Date(task.completedDate) : null);
            if (completedDate) {
              // Geçersiz tarih kontrolü
              if (isNaN(completedDate.getTime())) {
                return false;
              }
              completedDate.setHours(0, 0, 0, 0);
              // Bugünden ÖNCE tamamlanmış görevler geçmişe gider
              // Bugün veya gelecekte tamamlanmış görevler arşive GİTMEZ
              return completedDate.getTime() < today.getTime();
            }
          }
          return false;
        })
        .map(task => {
          // Tarih olarak oluşturulma tarihini veya tamamlanma tarihini kullan
          const createdDate = task.createdAt ? new Date(task.createdAt) : (task.createdDate ? new Date(task.createdDate) : null);
          const completedDate = task.completedAt ? new Date(task.completedAt) : (task.completedDate ? new Date(task.completedDate) : null);
          let date = createdDate || completedDate || new Date();
          
          // Eğer tamamlanmışsa ve tamamlanma tarihi varsa onu kullan
          if (task.isCompleted && completedDate && !isNaN(completedDate.getTime())) {
            date = completedDate;
          } else if (createdDate && !isNaN(createdDate.getTime())) {
            date = createdDate;
          } else {
            // Geçersiz tarih varsa bugünden önceki bir tarih kullan (gösterilmesin)
            date = new Date(today);
            date.setDate(date.getDate() - 1);
          }
          
          return {
            ...task,
            date: date
          };
        })
        .filter(task => {
          // Son bir kontrol: Gelecek tarihli görevleri filtrele
          const taskDate = new Date(task.date);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.getTime() < today.getTime();
        })
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
          <h1 className="page-title">Arşiv</h1>
        </div>
      </header>

      <div className="todo-list-container history-container">
        {historyItems.length === 0 ? (
          <div className="no-history-message">
            <FiClock style={{ fontSize: '48px', color: '#d1d5db', marginBottom: '16px' }} />
            <p>Henüz arşivlenmiş görev yok.</p>
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
                    <div key={task.taskID} className={`history-task-item ${task.isCompleted ? 'completed' : ''}`}>
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
                        {!task.isCompleted && (
                          <span className="history-task-status" style={{ 
                            fontSize: '11px', 
                            color: '#ffb900',
                            fontWeight: '500',
                            marginTop: '2px'
                          }}>
                            Devam ediyor
                          </span>
                        )}
                      </div>
                      <div className="history-task-time">
                        {task.isCompleted && task.completedAt ? (
                          new Date(task.completedAt).toLocaleTimeString('tr-TR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        ) : (
                          task.createdAt ? (
                            new Date(task.createdAt).toLocaleTimeString('tr-TR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          ) : (task.createdDate ? (
                            new Date(task.createdDate).toLocaleTimeString('tr-TR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          ) : '')
                        )}
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

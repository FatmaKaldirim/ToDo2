import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import "./Tamamlananlar.css";
import { FiCheckCircle, FiTrash2, FiStar } from "react-icons/fi";

export default function Tamamlananlar() {
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);

  const loadCompletedTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/Tasks/list");
      const completed = (res.data || []).filter(task => task.isCompleted);
      setCompletedTasks(completed);
    } catch (error) {
      console.error("Failed to load completed tasks:", error);
      setCompletedTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCompletedTasks();
  }, [loadCompletedTasks]);

  const uncompleteTask = async (task) => {
    try {
      await api.put("/Tasks/update", {
        taskID: task.taskID,
        isCompleted: false
      });
      loadCompletedTasks();
      setSelectedTask(null);
    } catch (error) {
      console.error("Failed to uncomplete task:", error);
    }
  };

  const deleteTask = async (taskId) => {
    if (window.confirm("Bu görevi silmek istediğinize emin misiniz?")) {
      try {
        await api.delete(`/Tasks/delete/${taskId}`);
        loadCompletedTasks();
        setSelectedTask(null);
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className="loading-full-page">Yükleniyor...</div>;

  return (
    <div className="todo-layout">
      <header className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FiCheckCircle style={{ fontSize: '24px', color: '#10b981' }} />
          <h1 className="page-title">Tamamlananlar</h1>
        </div>
        <p className="page-subtitle">{completedTasks.length} tamamlanmış görev</p>
      </header>

      <div className="todo-list-container">
        {completedTasks.length === 0 ? (
          <div className="no-tasks-message">
            <FiCheckCircle style={{ fontSize: '48px', color: '#d1d5db', marginBottom: '16px' }} />
            <p>Henüz tamamlanmış görev yok.</p>
          </div>
        ) : (
          <div className="completed-tasks-list">
            {completedTasks.map(task => (
              <div
                key={task.taskID}
                className={`task-row completed ${selectedTask?.taskID === task.taskID ? "selected" : ""}`}
                onClick={() => setSelectedTask(task)}
              >
                <button
                  className="check-btn filled"
                  onClick={(e) => {
                    e.stopPropagation();
                    uncompleteTask(task);
                  }}
                  title="Tamamlanmamış olarak işaretle"
                />
                <div className="task-info">
                  <span className="task-name">{task.taskName}</span>
                  {task.dueDate && (
                    <span className="task-date">
                      {formatDate(task.dueDate)}
                    </span>
                  )}
                </div>
                {task.isImportant && (
                  <FiStar className="star-icon filled" title="Önemli" />
                )}
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(task.taskID);
                  }}
                  title="Görevi sil"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        )}

        {selectedTask && (
          <div className="task-detail-panel">
            <div className="detail-header">
              <h3>{selectedTask.taskName}</h3>
              <button
                className="close-detail-btn"
                onClick={() => setSelectedTask(null)}
              >
                ×
              </button>
            </div>
            <div className="detail-content">
              {selectedTask.taskContent && (
                <div className="detail-section">
                  <h4>Açıklama</h4>
                  <p>{selectedTask.taskContent}</p>
                </div>
              )}
              {selectedTask.dueDate && (
                <div className="detail-section">
                  <h4>Son Tarih</h4>
                  <p>{formatDate(selectedTask.dueDate)}</p>
                </div>
              )}
              {selectedTask.reminderDate && (
                <div className="detail-section">
                  <h4>Hatırlatma</h4>
                  <p>{formatDate(selectedTask.reminderDate)}</p>
                </div>
              )}
              <div className="detail-actions">
                <button
                  className="action-btn uncomplete"
                  onClick={() => uncompleteTask(selectedTask)}
                >
                  <FiCheckCircle style={{ marginRight: '8px' }} />
                  Tamamlanmamış Olarak İşaretle
                </button>
                <button
                  className="action-btn delete"
                  onClick={() => deleteTask(selectedTask.taskID)}
                >
                  <FiTrash2 style={{ marginRight: '8px' }} />
                  Görevi Sil
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


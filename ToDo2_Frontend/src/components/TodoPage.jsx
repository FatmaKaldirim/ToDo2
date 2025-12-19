import { useEffect, useState } from "react";
import api from "../api/axios";
import "./TodoPage.css";

export default function TodoPage({ title, pageType }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);

  /* ===== LOAD ===== */
  const loadTasks = async () => {
    const res = await api.get("/Tasks/list");
    setTasks(res.data);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  /* ===== ADD ===== */
  const addTask = async (e) => {
    if (e.key !== "Enter" || !newTask.trim()) return;

    await api.post("/Tasks/add", {
      taskName: newTask,
      isCompleted: false,
      isImportant: false,
      isInMyDay: pageType === "gunum",
      dueDate: null,
      listID: null
    });

    setNewTask("");
    loadTasks();
  };

  /* ===== UPDATE ===== */
  const updateTask = async (task) => {
    await api.put("/Tasks/update", task);
    setSelectedTask(task);
    loadTasks();
  };

  /* ===== FILTER ===== */
  const activeTasks = tasks.filter(t => {
    if (pageType === "gunum") return t.isInMyDay && !t.isCompleted;
    if (pageType === "onemli") return t.isImportant && !t.isCompleted;
    if (pageType === "planlanan") return t.dueDate && !t.isCompleted;
    return !t.isCompleted;
  });

  const completedTasks = tasks.filter(t => t.isCompleted);

  return (
    <div className="todo-layout">

      {/* ===== ORTA GÖREV LİSTESİ ===== */}
      <div className="todo-list">
        <h1>{title}</h1>

        <ul className="task-ul">
          {activeTasks.map(task => (
            <li
              key={task.taskID}
              className="task-row"
              onClick={() => {
                console.log("SATIR TIKLANDI", task.taskID);
                setSelectedTask(task); // ✅ SAĞ PANEL
              }}
            >
              {/* ✔ TAMAMLANDI */}
              <button
                className="check-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  updateTask({ ...task, isCompleted: true });
                }}
              />

              {/* İSİM */}
              <span className="task-name">
                {task.taskName}
              </span>

              {/* ⭐ ÖNEMLİ */}
              <button
                className="star-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  updateTask({ ...task, isImportant: !task.isImportant });
                }}
              >
                {task.isImportant ? "★" : "☆"}
              </button>
            </li>
          ))}
        </ul>

        {/* ===== TAMAMLANAN ===== */}
        {completedTasks.length > 0 && (
          <>
            <h4 className="completed-title">Tamamlandı</h4>
            <ul className="task-ul">
              {completedTasks.map(task => (
                <li key={task.taskID} className="task-row done">
                  <button
                    className="check-btn filled"
                    onClick={() =>
                      updateTask({ ...task, isCompleted: false })
                    }
                  />
                  <span className="task-name">
                    {task.taskName}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* ===== ALT GÖREV EKLE ===== */}
      <div className="add-task-bar">
        <button className="check-btn" />
        <input
          placeholder="Görev ekle"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={addTask}
        />
      </div>

      {/* ===== SAĞ PANEL ===== */}
      <aside className={`task-detail ${selectedTask ? "open" : ""}`}>
        <button
          className="close-btn"
          onClick={() => setSelectedTask(null)}
        >
          ✕
        </button>

        {selectedTask && (
          <>
            <div className="detail-card header-card">
              <button className="check-btn" />
              <span className="detail-title">
                {selectedTask.taskName}
              </span>
              <button
                className="star-btn"
                onClick={() =>
                  updateTask({
                    ...selectedTask,
                    isImportant: !selectedTask.isImportant
                  })
                }
              >
                {selectedTask.isImportant ? "★" : "☆"}
              </button>
            </div>

            <div
              className="detail-card action"
              onClick={() =>
                updateTask({ ...selectedTask, isInMyDay: true })
              }
            >
              ☀ Günüm’e ekle
            </div>

            <div className="detail-card action">
              📅 Son tarih
              <input
                type="date"
                value={selectedTask.dueDate || ""}
                onChange={(e) =>
                  updateTask({
                    ...selectedTask,
                    dueDate: e.target.value
                  })
                }
              />
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

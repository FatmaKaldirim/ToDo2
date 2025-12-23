import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import { useAuth } from "../utils/auth";
import "./Takvim.css";
import { FiCalendar, FiClock, FiList } from "react-icons/fi";

export default function Takvim() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState("monthly"); // monthly, weekly
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyTasks, setDailyTasks] = useState([]);
  const [weeklyTasks, setWeeklyTasks] = useState([]);
  const [monthlyTasks, setMonthlyTasks] = useState([]);
  const [dailyNotes, setDailyNotes] = useState([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [selectedDateForNote, setSelectedDateForNote] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    setLoading(true);
    Promise.all([loadDailyTasks(), loadWeeklyTasks(), loadMonthlyTasks()]).then(() => {
      setLoading(false);
    });
  }, [loadDailyTasks, loadWeeklyTasks, loadMonthlyTasks]);

  const addDailyNote = async (date) => {
    if (!newNoteText.trim()) return;
    try {
      await api.post("/Notes/add", {
        taskID: null,
        noteText: `[${date.toLocaleDateString('tr-TR')}] ${newNoteText}`
      });
      setNewNoteText("");
      setSelectedDateForNote(null);
      // Reload notes if needed
    } catch (error) {
      console.error("Failed to add note:", error);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    // JavaScript getDay(): 0=Pazar, 1=Pazartesi, ... 6=Cumartesi
    // Türkiye'de hafta Pazartesi başlar, bu yüzden: 0->6, 1->0, 2->1, ... 6->5
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    
    const days = [];
    // Add empty cells for days before the first day of the month (Pazartesi başlangıç)
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.toDateString() === date2.toDateString();
  };

  const getTasksForDate = (date) => {
    if (!date) return { daily: [], weekly: [], monthly: [] };
    
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - dayOfWeek);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const daily = dailyTasks.filter(t => {
      // DailyTaskDto has TaskDate field
      const taskDate = t.taskDate ? new Date(t.taskDate).toISOString().split('T')[0] : null;
      return taskDate === dateStr;
    });

    const weekly = weeklyTasks.filter(t => {
      const weekStartDate = new Date(t.weekStartDate);
      // Hafta Pazartesi başlar
      const dayOfWeek = weekStartDate.getDay() === 0 ? 6 : weekStartDate.getDay() - 1;
      const weekStartAdjusted = new Date(weekStartDate);
      weekStartAdjusted.setDate(weekStartDate.getDate() - dayOfWeek);
      // Seçili tarihin hafta başlangıcını hesapla
      const selectedDayOfWeek = date.getDay() === 0 ? 6 : date.getDay() - 1;
      const selectedWeekStart = new Date(date);
      selectedWeekStart.setDate(date.getDate() - selectedDayOfWeek);
      return weekStartAdjusted.toDateString() === selectedWeekStart.toDateString();
    });

    const monthly = monthlyTasks.filter(t => {
      // MonthlyTaskDto has MonthDate field
      const taskDate = new Date(t.monthDate);
      return taskDate.getMonth() === date.getMonth() && taskDate.getFullYear() === date.getFullYear();
    });

    return { daily, weekly, monthly };
  };

  const days = getDaysInMonth(selectedDate);
  const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  const dayNames = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]; // Pazartesi ile başlıyor

  const navigateMonth = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + direction);
    setSelectedDate(newDate);
  };

  if (loading) return <div className="loading-full-page">Yükleniyor...</div>;

  return (
    <div className="todo-layout">
      <header className="page-header calendar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <FiCalendar style={{ fontSize: '24px', color: '#7c3aed' }} />
          <h1 className="page-title">Takvim</h1>
          <div className="view-mode-buttons">
            <button
              className={`view-mode-btn ${viewMode === "monthly" ? "active" : ""}`}
              onClick={() => setViewMode("monthly")}
            >
              Aylık
            </button>
            <button
              className={`view-mode-btn ${viewMode === "weekly" ? "active" : ""}`}
              onClick={() => setViewMode("weekly")}
            >
              Haftalık
            </button>
          </div>
        </div>
        <div className="calendar-navigation">
          <button onClick={() => navigateMonth(-1)} className="nav-month-btn">‹</button>
          <span className="current-month">
            {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
          </span>
          <button onClick={() => navigateMonth(1)} className="nav-month-btn">›</button>
        </div>
      </header>

      <div className="todo-list-container calendar-container">
        {viewMode === "monthly" && (
          <div className="calendar-grid">
            <div className="calendar-weekdays">
              {dayNames.map(day => (
                <div key={day} className="calendar-weekday">{day}</div>
              ))}
            </div>
            <div className="calendar-days">
              {days.map((date, index) => {
                const tasks = getTasksForDate(date);
                const totalTasks = tasks.daily.length + tasks.weekly.length + tasks.monthly.length;
                const isToday = isSameDay(date, new Date());
                const isSelected = isSameDay(date, selectedDateForNote);

                return (
                  <div
                    key={index}
                    className={`calendar-day ${!date ? "empty" : ""} ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}`}
                    onClick={() => date && setSelectedDateForNote(date)}
                  >
                    {date && (
                      <>
                        <div className="calendar-day-number">{date.getDate()}</div>
                        {totalTasks > 0 && (
                          <div className="calendar-day-tasks">
                            {tasks.daily.length > 0 && (
                              <span className="task-indicator daily" title={`${tasks.daily.length} günlük görev`}>
                                <FiCalendar style={{ marginRight: '4px', fontSize: '12px' }} />
                                {tasks.daily.length}
                              </span>
                            )}
                            {tasks.weekly.length > 0 && (
                              <span className="task-indicator weekly" title={`${tasks.weekly.length} haftalık görev`}>
                                <FiClock style={{ marginRight: '4px', fontSize: '12px' }} />
                                {tasks.weekly.length}
                              </span>
                            )}
                            {tasks.monthly.length > 0 && (
                              <span className="task-indicator monthly" title={`${tasks.monthly.length} aylık görev`}>
                                <FiList style={{ marginRight: '4px', fontSize: '12px' }} />
                                {tasks.monthly.length}
                              </span>
                            )}
                          </div>
                        )}
                        {isSelected && (
                          <div className="day-note-input">
                            <textarea
                              placeholder="Bu güne not ekle..."
                              value={newNoteText}
                              onChange={(e) => setNewNoteText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.ctrlKey) {
                                  addDailyNote(date);
                                }
                              }}
                              autoFocus
                            />
                            <button onClick={() => addDailyNote(date)} className="add-note-day-btn">
                              Not Ekle
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === "weekly" && (
          <div className="calendar-weekly-view">
            <div className="weekly-header">
              <div className="weekly-day-header">Pazartesi</div>
              <div className="weekly-day-header">Salı</div>
              <div className="weekly-day-header">Çarşamba</div>
              <div className="weekly-day-header">Perşembe</div>
              <div className="weekly-day-header">Cuma</div>
              <div className="weekly-day-header">Cumartesi</div>
              <div className="weekly-day-header">Pazar</div>
            </div>
            <div className="weekly-days">
              {(() => {
                const weekStart = new Date(selectedDate);
                // Hafta Pazartesi başlar: getDay() 0=Pazar, 1=Pazartesi, ...
                // Eğer Pazar ise 6 gün geri, değilse getDay()-1 gün geri
                const dayOfWeek = weekStart.getDay() === 0 ? 6 : weekStart.getDay() - 1;
                weekStart.setDate(selectedDate.getDate() - dayOfWeek);
                const weekDays = [];
                for (let i = 0; i < 7; i++) {
                  const day = new Date(weekStart);
                  day.setDate(weekStart.getDate() + i);
                  weekDays.push(day);
                }
                return weekDays.map((day, idx) => {
                  const tasks = getTasksForDate(day);
                  const isToday = isSameDay(day, new Date());
                  const isSelected = isSameDay(day, selectedDateForNote);
                  return (
                    <div
                      key={idx}
                      className={`weekly-day ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}`}
                      onClick={() => setSelectedDateForNote(day)}
                    >
                      <div className="weekly-day-number">
                        {day.getDate()} {monthNames[day.getMonth()].substring(0, 3)}
                      </div>
                      <div className="weekly-day-tasks">
                        {tasks.daily.map((task, tIdx) => (
                          <div key={tIdx} className="weekly-task-item daily">
                            <FiCalendar style={{ marginRight: '6px', fontSize: '14px' }} />
                            Günlük
                          </div>
                        ))}
                        {tasks.weekly.map((task, tIdx) => (
                          <div key={tIdx} className="weekly-task-item weekly">
                            <FiClock style={{ marginRight: '6px', fontSize: '14px' }} />
                            Haftalık
                          </div>
                        ))}
                        {tasks.monthly.map((task, tIdx) => (
                          <div key={tIdx} className="weekly-task-item monthly">
                            <FiList style={{ marginRight: '6px', fontSize: '14px' }} />
                            Aylık
                          </div>
                        ))}
                      </div>
                      {isSelected && (
                        <div className="day-note-input">
                          <textarea
                            placeholder="Bu güne not ekle..."
                            value={newNoteText}
                            onChange={(e) => setNewNoteText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.ctrlKey) {
                                addDailyNote(day);
                              }
                            }}
                            autoFocus
                          />
                          <button onClick={() => addDailyNote(day)} className="add-note-day-btn">
                            Not Ekle
                          </button>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


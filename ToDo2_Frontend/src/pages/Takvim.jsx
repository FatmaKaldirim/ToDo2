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
  const [allNotes, setAllNotes] = useState([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [selectedDateForNote, setSelectedDateForNote] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [modalDate, setModalDate] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState("");
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

  const loadCalendarNotes = useCallback(async () => {
    try {
      const res = await api.get("/Notes/me");
      // Sadece takvim notlarını filtrele (taskID null ve tarih formatında başlayan)
      const calendarNotes = (res.data || []).filter(note => 
        note.taskID === null && /^\[\d{1,2}\.\d{1,2}\.\d{4}\]/.test(note.noteText)
      );
      setAllNotes(calendarNotes);
    } catch (error) {
      console.error("Failed to load calendar notes:", error);
      setAllNotes([]);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadDailyTasks(), loadWeeklyTasks(), loadMonthlyTasks(), loadCalendarNotes()]).then(() => {
      setLoading(false);
    });
  }, [loadDailyTasks, loadWeeklyTasks, loadMonthlyTasks, loadCalendarNotes]);

  const addDailyNote = async (date) => {
    if (!newNoteText.trim()) return;
    try {
      await api.post("/Notes/add", {
        taskID: null,
        noteText: `[${date.toLocaleDateString('tr-TR')}] ${newNoteText}`
      });
      setNewNoteText("");
      setSelectedDateForNote(null);
      await loadCalendarNotes();
    } catch (error) {
      console.error("Failed to add note:", error);
    }
  };

  const getNotesForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toLocaleDateString('tr-TR');
    return allNotes.filter(note => {
      const match = note.noteText.match(/^\[([^\]]+)\]/);
      if (match) {
        return match[1] === dateStr;
      }
      return false;
    });
  };

  // Önemli günler için sembol fonksiyonu
  const getSpecialDayIcon = (date) => {
    if (!date) return null;
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Yılbaşı - 1 Ocak
    if (month === 1 && day === 1) return '🎄';
    
    // 14 Şubat Sevgililer Günü
    if (month === 2 && day === 14) return '💝';
    
    // 8 Mart Dünya Kadınlar Günü
    if (month === 3 && day === 8) return '🌸';
    
    // 23 Nisan Ulusal Egemenlik ve Çocuk Bayramı
    if (month === 4 && day === 23) return '🇹🇷';
    
    // 1 Mayıs İşçi Bayramı
    if (month === 5 && day === 1) return '👷';
    
    // 19 Mayıs Atatürk'ü Anma, Gençlik ve Spor Bayramı
    if (month === 5 && day === 19) return '🇹🇷';
    
    // 15 Temmuz Demokrasi ve Milli Birlik Günü
    if (month === 7 && day === 15) return '🇹🇷';
    
    // 30 Ağustos Zafer Bayramı
    if (month === 8 && day === 30) return '🇹🇷';
    
    // 29 Ekim Cumhuriyet Bayramı
    if (month === 10 && day === 29) return '🇹🇷';
    
    // 10 Kasım Atatürk'ü Anma Günü
    if (month === 11 && day === 10) return '🇹🇷';
    
    // 31 Aralık Yılbaşı Arifesi
    if (month === 12 && day === 31) return '🎉';
    
    return null;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    // JavaScript getDay(): 0=Sunday, 1=Monday, ..., 6=Saturday
    // We want Monday=0, so we convert: (getDay() + 6) % 7
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0, Sunday = 6
    
    const days = [];
    // Add empty cells for days before the first day of the month
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
    // Calculate Monday of the week for weekly tasks
    const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Convert to Monday-based
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() + daysToMonday);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const daily = dailyTasks.filter(t => {
      // DailyTaskDto has TaskDate field
      const taskDate = t.taskDate ? new Date(t.taskDate).toISOString().split('T')[0] : null;
      return taskDate === dateStr;
    });

    const weekly = weeklyTasks.filter(t => {
      const weekStartDate = new Date(t.weekStartDate);
      const dayOfWeek = weekStartDate.getDay();
      const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const weekStartAdjusted = new Date(weekStartDate);
      weekStartAdjusted.setDate(weekStartDate.getDate() + daysToMonday);
      return weekStartAdjusted.toDateString() === weekStart.toDateString();
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
  const dayNames = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]; // Monday first

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
                const notes = getNotesForDate(date);
                const totalTasks = tasks.daily.length + tasks.weekly.length + tasks.monthly.length;
                const isToday = isSameDay(date, new Date());
                const isSelected = isSameDay(date, selectedDateForNote);
                const specialIcon = getSpecialDayIcon(date);

                return (
                  <div
                    key={index}
                    className={`calendar-day ${!date ? "empty" : ""} ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}`}
                    onClick={() => date && setSelectedDateForNote(date)}
                  >
                    {date && (
                      <>
                        <div className="calendar-day-header">
                        <div className="calendar-day-number">{date.getDate()}</div>
                          {specialIcon && (
                            <span className="special-day-icon" title="Önemli Gün">
                              {specialIcon}
                            </span>
                          )}
                        </div>
                        {notes.length > 0 && (
                          <div 
                            className="calendar-notes-badge"
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalDate(date);
                              setShowNotesModal(true);
                            }}
                            onMouseEnter={() => setHoveredDate(date)}
                            onMouseLeave={() => setHoveredDate(null)}
                            title={`${notes.length} not - Tıklayarak görüntüle`}
                          >
                            <span className="note-icon-small">📝</span>
                            <span className="note-count">{notes.length}</span>
                            {hoveredDate && isSameDay(hoveredDate, date) && (
                              <div className="notes-tooltip">
                                {notes.map((note, idx) => (
                                  <div key={idx} className="tooltip-note-item">
                                    {note.noteText.replace(/^\[[^\]]+\]\s*/, '')}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
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
                // Get Monday of the week (getDay(): 0=Sunday, 1=Monday, ...)
                // We want Monday to be the first day
                const weekStart = new Date(selectedDate);
                const dayOfWeek = selectedDate.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
                const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Convert to Monday-based
                weekStart.setDate(selectedDate.getDate() + daysToMonday);
                const weekDays = [];
                for (let i = 0; i < 7; i++) {
                  const day = new Date(weekStart);
                  day.setDate(weekStart.getDate() + i);
                  weekDays.push(day);
                }
                return weekDays.map((day, idx) => {
                  const tasks = getTasksForDate(day);
                  const notes = getNotesForDate(day);
                  const isToday = isSameDay(day, new Date());
                  const isSelected = isSameDay(day, selectedDateForNote);
                  const specialIcon = getSpecialDayIcon(day);
                  return (
                    <div
                      key={idx}
                      className={`weekly-day ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}`}
                      onClick={() => setSelectedDateForNote(day)}
                    >
                      <div className="weekly-day-number">
                        {day.getDate()} {monthNames[day.getMonth()].substring(0, 3)}
                        {specialIcon && (
                          <span className="special-day-icon" title="Önemli Gün" style={{ marginLeft: '8px' }}>
                            {specialIcon}
                          </span>
                        )}
                      </div>
                      {notes.length > 0 && (
                        <div className="weekly-notes-list">
                          {notes.map((note, noteIdx) => (
                            <div key={noteIdx} className="weekly-note-item-full">
                              {editingNoteId === note.noteID ? (
                                <div className="weekly-note-edit">
                                  <textarea
                                    className="weekly-note-edit-input"
                                    value={editingNoteText}
                                    onChange={(e) => setEditingNoteText(e.target.value)}
                                    autoFocus
                                    rows={3}
                                  />
                                  <div className="weekly-note-edit-actions">
                                    <button
                                      className="weekly-note-save-btn"
                                      onClick={async () => {
                                        try {
                                          await api.put("/Notes/update", {
                                            noteID: note.noteID,
                                            taskID: null,
                                            noteText: `[${day.toLocaleDateString('tr-TR')}] ${editingNoteText}`
                                          });
                                          setEditingNoteId(null);
                                          setEditingNoteText("");
                                          await loadCalendarNotes();
                                        } catch (error) {
                                          console.error("Failed to update note:", error);
                                        }
                                      }}
                                    >
                                      Kaydet
                                    </button>
                                    <button
                                      className="weekly-note-cancel-btn"
                                      onClick={() => {
                                        setEditingNoteId(null);
                                        setEditingNoteText("");
                                      }}
                                    >
                                      İptal
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="weekly-note-content">
                                    <span className="weekly-note-text">
                                      {note.noteText.replace(/^\[[^\]]+\]\s*/, '')}
                                    </span>
                                    <div className="weekly-note-actions">
                                      <button
                                        className="weekly-note-action-btn"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingNoteId(note.noteID);
                                          setEditingNoteText(note.noteText.replace(/^\[[^\]]+\]\s*/, ''));
                                        }}
                                        title="Düzenle"
                                      >
                                        ✏️
                                      </button>
                                      <button
                                        className="weekly-note-action-btn"
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          if (window.confirm("Bu notu silmek istediğinize emin misiniz?")) {
                                            try {
                                              await api.delete(`/Notes/delete/${note.noteID}`);
                                              await loadCalendarNotes();
                                            } catch (error) {
                                              console.error("Failed to delete note:", error);
                                            }
                                          }
                                        }}
                                        title="Sil"
                                      >
                                        🗑️
                                      </button>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
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

      {/* Notes Modal */}
      {showNotesModal && modalDate && (
        <div className="notes-modal-overlay" onClick={() => setShowNotesModal(false)}>
          <div className="notes-modal" onClick={(e) => e.stopPropagation()}>
            <div className="notes-modal-header">
              <h3>{formatDate(modalDate)} - Notlar</h3>
              <button className="notes-modal-close" onClick={() => setShowNotesModal(false)}>✕</button>
            </div>
            <div className="notes-modal-content">
              {getNotesForDate(modalDate).length === 0 ? (
                <p className="no-notes-in-modal">Bu güne ait not yok.</p>
              ) : (
                getNotesForDate(modalDate).map((note, idx) => (
                  <div key={idx} className="modal-note-item">
                    <p>{note.noteText.replace(/^\[[^\]]+\]\s*/, '')}</p>
                    <span className="modal-note-date">
                      {new Date(note.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


import api from "../api/axios";

class ReminderService {
  constructor() {
    this.checkInterval = null;
    this.notifiedTasks = new Set(); // Bildirim gösterilen görevlerin ID'leri
    this.checkIntervalMs = 60000; // Her 1 dakikada bir kontrol et
    this.isRunning = false;
  }

  // Browser Notification izni iste
  async requestPermission() {
    if (!("Notification" in window)) {
      console.log("Bu tarayıcı bildirimleri desteklemiyor.");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  }

  // Bildirim göster
  showNotification(task) {
    if (!task.reminderDate) return;

    const reminderTime = new Date(task.reminderDate);
    const now = new Date();
    
    // Sadece hatırlatma zamanı geldiyse ve daha önce bildirim gösterilmediyse
    if (reminderTime <= now && !this.notifiedTasks.has(task.taskID)) {
      const taskName = task.taskName || "Görev";
      const options = {
        body: task.taskContent || "Hatırlatma zamanı geldi!",
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: `task-${task.taskID}`, // Aynı görev için tekrar bildirim göstermemek için
        requireInteraction: false,
        silent: false
      };

      try {
        const notification = new Notification(`🔔 ${taskName}`, options);
        
        // Bildirim tıklandığında sayfayı focus et
        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        // Bildirimi gösterildi olarak işaretle
        this.notifiedTasks.add(task.taskID);

        // 5 saniye sonra bildirimi kapat
        setTimeout(() => {
          notification.close();
        }, 5000);
      } catch (error) {
        console.error("Bildirim gösterilirken hata:", error);
      }
    }
  }

  // Tüm görevleri kontrol et ve bildirim göster
  async checkReminders() {
    try {
      const response = await api.get("/Tasks/list");
      const tasks = response.data || [];

      // Sadece tamamlanmamış ve reminderDate'i olan görevleri kontrol et
      const tasksWithReminders = tasks.filter(
        task => !task.isCompleted && task.reminderDate
      );

      tasksWithReminders.forEach(task => {
        this.showNotification(task);
      });

      // Tamamlanan görevlerin bildirimlerini temizle
      const completedTaskIds = tasks
        .filter(task => task.isCompleted)
        .map(task => task.taskID);
      
      completedTaskIds.forEach(taskId => {
        this.notifiedTasks.delete(taskId);
      });
    } catch (error) {
      console.error("Hatırlatmalar kontrol edilirken hata:", error);
    }
  }

  // Servisi başlat
  async start() {
    if (this.isRunning) return;

    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      console.log("Bildirim izni verilmedi.");
      return;
    }

    this.isRunning = true;
    
    // İlk kontrolü hemen yap
    await this.checkReminders();

    // Periyodik kontrolü başlat
    this.checkInterval = setInterval(() => {
      this.checkReminders();
    }, this.checkIntervalMs);

    console.log("Hatırlatma servisi başlatıldı.");
  }

  // Servisi durdur
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    this.notifiedTasks.clear();
    console.log("Hatırlatma servisi durduruldu.");
  }

  // Bildirim geçmişini temizle (görev güncellendiğinde kullanılabilir)
  clearNotification(taskId) {
    this.notifiedTasks.delete(taskId);
  }
}

// Singleton instance
const reminderService = new ReminderService();

export default reminderService;


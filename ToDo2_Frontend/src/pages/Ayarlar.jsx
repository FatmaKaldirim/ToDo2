import { useState, useEffect } from "react";
import { useAuth } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./Ayarlar.css";
import { FiSettings, FiUser, FiMail, FiLogOut, FiTrash2, FiSave, FiSun, FiMoon, FiEye, FiEyeOff, FiLock, FiDownload, FiUpload, FiBell, FiGlobe, FiZap, FiDatabase, FiCheck, FiX } from "react-icons/fi";
import reminderService from "../utils/reminderService";

export default function Ayarlar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  const [showCompletedTasks, setShowCompletedTasks] = useState(() => {
    return localStorage.getItem('showCompletedTasks') !== 'false';
  });
  const [enableNoteDownload, setEnableNoteDownload] = useState(() => {
    return localStorage.getItem('enableNoteDownload') !== 'false';
  });
  const [autoCompleteTaskWhenStepsDone, setAutoCompleteTaskWhenStepsDone] = useState(() => {
    return localStorage.getItem('autoCompleteTaskWhenStepsDone') !== 'false';
  });
  const [notificationPermission, setNotificationPermission] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('showCompletedTasks', showCompletedTasks);
    // Global state'e kaydet veya context kullan
    document.body.setAttribute('data-show-completed', showCompletedTasks);
  }, [showCompletedTasks]);

  useEffect(() => {
    localStorage.setItem('enableNoteDownload', enableNoteDownload);
  }, [enableNoteDownload]);

  useEffect(() => {
    localStorage.setItem('autoCompleteTaskWhenStepsDone', autoCompleteTaskWhenStepsDone);
  }, [autoCompleteTaskWhenStepsDone]);

  // Bildirim izni durumunu kontrol et
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleRequestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Bu tarayıcı bildirimleri desteklemiyor.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        // İzin verildiyse servisi başlat
        reminderService.start();
        alert('Bildirim izni verildi! Hatırlatmalar aktif.');
      } else if (permission === 'denied') {
        alert('Bildirim izni reddedildi. Tarayıcı ayarlarından izin verebilirsiniz.');
      }
    } catch (error) {
      console.error('Bildirim izni istenirken hata:', error);
      alert('Bildirim izni istenirken bir hata oluştu.');
    }
  };

  // Kullanıcı bilgilerini yükle
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        setLoadingUser(true);
        const res = await api.get("/Users/me");
        setName(res.data.name || "");
        setEmail(res.data.email || "");
      } catch (error) {
        console.error("Kullanıcı bilgileri yüklenemedi:", error);
      } finally {
        setLoadingUser(false);
      }
    };

    if (user) {
      loadUserInfo();
    }
  }, [user]);

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      alert("Lütfen tüm alanları doldurun.");
      return;
    }

    try {
      setSaving(true);
      await api.put("/Users/update", {
        userName: name.trim(),
        userMail: email.trim()
      });
      alert("Profil başarıyla güncellendi!");
      // Auth context'i güncellemek için sayfayı yenile
      window.location.reload();
    } catch (error) {
      console.error("Profil güncellenemedi:", error);
      const errorMessage = error.response?.data?.message || error.response?.data || "Profil güncellenirken bir hata oluştu.";
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    const confirmMessage = "Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve tüm verileriniz silinecektir.";
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setLoading(true);
      await api.delete("/Users/delete");
      alert("Hesabınız başarıyla silindi.");
      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      console.error("Hesap silinemedi:", error);
      alert("Hesap silinirken bir hata oluştu.");
    } finally {
      setLoading(false);
    setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="todo-layout">
      <header className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FiSettings style={{ fontSize: '24px', color: '#7c3aed' }} />
          <h1 className="page-title">Ayarlar</h1>
        </div>
      </header>

      <div className="todo-list-container settings-container">
        {/* Profil Bilgileri */}
        <div className="settings-section">
          <div className="settings-section-header">
            <FiUser style={{ fontSize: '20px', color: '#7c3aed', marginRight: '12px' }} />
            <h2 className="settings-section-title">Profil Bilgileri</h2>
          </div>
          <div className="settings-content">
            <div className="settings-field">
              <label className="settings-label">
                <FiUser style={{ marginRight: '8px' }} />
                Ad
              </label>
              <input
                type="text"
                className="settings-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Adınızı girin"
              />
            </div>
            <div className="settings-field">
              <label className="settings-label">
                <FiMail style={{ marginRight: '8px' }} />
                E-posta
              </label>
              <input
                type="email"
                className="settings-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-posta adresinizi girin"
              />
            </div>
            <button className="settings-save-btn" onClick={handleSave} disabled={saving || loadingUser}>
              <FiSave style={{ marginRight: '8px' }} />
              {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </div>
        </div>

        {/* Uygulama Ayarları */}
        <div className="settings-section">
          <div className="settings-section-header">
            <FiSettings style={{ fontSize: '20px', color: '#7c3aed', marginRight: '12px' }} />
            <h2 className="settings-section-title">Uygulama Ayarları</h2>
          </div>
          <div className="settings-content">
            <div className="settings-field">
              <label className="settings-label">
                <FiSun style={{ marginRight: '8px' }} />
                Tema
              </label>
              <div className="theme-selector">
                <button
                  className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => setTheme('light')}
                >
                  <FiSun style={{ marginRight: '8px' }} />
                  Açık Tema
                </button>
                <button
                  className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  <FiMoon style={{ marginRight: '8px' }} />
                  Koyu Tema
                </button>
              </div>
            </div>
            <div className="settings-field">
              <label className="settings-label">
                {showCompletedTasks ? <FiEye style={{ marginRight: '8px' }} /> : <FiEyeOff style={{ marginRight: '8px' }} />}
                Tamamlanan Görevleri Göster
              </label>
              <div className="theme-selector">
                <button
                  className={`theme-btn ${showCompletedTasks ? 'active' : ''}`}
                  onClick={() => setShowCompletedTasks(true)}
                >
                  <FiEye style={{ marginRight: '8px' }} />
                  Göster
                </button>
                <button
                  className={`theme-btn ${!showCompletedTasks ? 'active' : ''}`}
                  onClick={() => setShowCompletedTasks(false)}
                >
                  <FiEyeOff style={{ marginRight: '8px' }} />
                  Gizle
                </button>
              </div>
            </div>
            <div className="settings-field">
              <label className="settings-label">
                <FiDownload style={{ marginRight: '8px' }} />
                Not İndirmeyi Etkinleştir
              </label>
              <div className="theme-selector">
                <button
                  className={`theme-btn ${enableNoteDownload ? 'active' : ''}`}
                  onClick={() => setEnableNoteDownload(true)}
                >
                  <FiDownload style={{ marginRight: '8px' }} />
                  Açık
                </button>
                <button
                  className={`theme-btn ${!enableNoteDownload ? 'active' : ''}`}
                  onClick={() => setEnableNoteDownload(false)}
                >
                  <FiEyeOff style={{ marginRight: '8px' }} />
                  Kapalı
                </button>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                Notlar sayfasında ve not defterinde notları TXT formatında indirme butonu görüntülenir.
              </p>
            </div>
            <div className="settings-field">
              <label className="settings-label">
                <FiCheck style={{ marginRight: '8px' }} />
                Adımlar Tamamlanınca Görevi Otomatik Tamamla
              </label>
              <div className="theme-selector">
                <button
                  className={`theme-btn ${autoCompleteTaskWhenStepsDone ? 'active' : ''}`}
                  onClick={() => setAutoCompleteTaskWhenStepsDone(true)}
                >
                  <FiCheck style={{ marginRight: '8px' }} />
                  Açık
                </button>
                <button
                  className={`theme-btn ${!autoCompleteTaskWhenStepsDone ? 'active' : ''}`}
                  onClick={() => setAutoCompleteTaskWhenStepsDone(false)}
                >
                  <FiX style={{ marginRight: '8px' }} />
                  Kapalı
                </button>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                Bir görevin tüm adımları tamamlandığında görev otomatik olarak tamamlanmış sayılır.
              </p>
            </div>
            <div className="settings-field">
              <label className="settings-label">
                <FiBell style={{ marginRight: '8px' }} />
                Bildirim İzni
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Durum: {
                    notificationPermission === 'granted' ? '✅ İzin Verildi' :
                    notificationPermission === 'denied' ? '❌ Reddedildi' :
                    '⚠️ Henüz İzin Verilmedi'
                  }
                </div>
                {notificationPermission !== 'granted' && (
                  <button
                    className="settings-btn"
                    onClick={handleRequestNotificationPermission}
                    style={{
                      padding: '8px 16px',
                      background: 'var(--accent-primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    <FiBell style={{ marginRight: '8px' }} />
                    Bildirim İzni İste
                  </button>
                )}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                Görev hatırlatmaları için bildirim izni gereklidir. İzin verildiğinde, hatırlatma zamanı geldiğinde bildirim alırsınız.
              </p>
            </div>
          </div>
        </div>

        {/* Hesap İşlemleri */}
        <div className="settings-section danger-section">
          <div className="settings-section-header">
            <h2 className="settings-section-title">Hesap İşlemleri</h2>
          </div>
          <div className="settings-content">
            <button className="settings-btn logout" onClick={handleLogout}>
              <FiLogOut style={{ marginRight: '8px' }} />
              Çıkış Yap
            </button>
            
            {!showDeleteConfirm ? (
              <button
                className="settings-btn delete"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <FiTrash2 style={{ marginRight: '8px' }} />
                Hesabı Sil
              </button>
            ) : (
              <div className="delete-confirm">
                <p className="delete-warning">
                  Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                </p>
                <div className="delete-actions">
                  <button
                    className="settings-btn confirm-delete"
                    onClick={handleDeleteAccount}
                    disabled={loading}
                  >
                    {loading ? 'Kaydediliyor...' : 'Evet, Sil'}
                  </button>
                  <button
                    className="settings-btn cancel-delete"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    İptal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


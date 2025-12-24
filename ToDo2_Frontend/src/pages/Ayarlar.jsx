import { useState, useEffect } from "react";
import { useAuth } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./Ayarlar.css";
import { FiSettings, FiUser, FiMail, FiLogOut, FiTrash2, FiSave, FiSun, FiMoon, FiEye, FiEyeOff, FiBell, FiBellOff } from "react-icons/fi";

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
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('showCompletedTasks', showCompletedTasks);
    // Global state'e kaydet veya context kullan
    document.body.setAttribute('data-show-completed', showCompletedTasks);
  }, [showCompletedTasks]);

  // Kullanıcı bilgilerini yükle
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        setLoadingUser(true);
        const res = await api.get("/Users/me");
        setName(res.data.name || "");
        setEmail(res.data.email || "");
        setEmailNotificationsEnabled(res.data.emailNotificationsEnabled ?? true);
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

  // Email bildirim ayarını güncelle
  const handleEmailNotificationsToggle = async (enabled) => {
    try {
      setLoading(true);
      await api.put("/Users/email-notifications", {
        emailNotificationsEnabled: enabled
      });
      setEmailNotificationsEnabled(enabled);
    } catch (error) {
      console.error("Email bildirim ayarı güncellenemedi:", error);
      alert("Email bildirim ayarı güncellenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    // TODO: API call to update user profile
    alert("Profil güncelleme özelliği yakında eklenecek.");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleDeleteAccount = () => {
    // TODO: API call to delete account
    alert("Hesap silme özelliği yakında eklenecek.");
    setShowDeleteConfirm(false);
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
                Ad Soyad
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
            <button className="settings-save-btn" onClick={handleSave}>
              <FiSave style={{ marginRight: '8px' }} />
              Değişiklikleri Kaydet
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
                Tamamlanan Görevler
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
                {emailNotificationsEnabled ? <FiBell style={{ marginRight: '8px' }} /> : <FiBellOff style={{ marginRight: '8px' }} />}
                E-posta Bildirimleri
              </label>
              <div className="theme-selector">
                <button
                  className={`theme-btn ${emailNotificationsEnabled ? 'active' : ''}`}
                  onClick={() => handleEmailNotificationsToggle(true)}
                  disabled={loading}
                >
                  <FiBell style={{ marginRight: '8px' }} />
                  Açık
                </button>
                <button
                  className={`theme-btn ${!emailNotificationsEnabled ? 'active' : ''}`}
                  onClick={() => handleEmailNotificationsToggle(false)}
                  disabled={loading}
                >
                  <FiBellOff style={{ marginRight: '8px' }} />
                  Kapalı
                </button>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                E-posta bildirimleri açıkken, kayıt olduğunuzda hoş geldin e-postası ve hatırlatma tarihi geldiğinde bildirim e-postası alırsınız.
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
                  >
                    Evet, Sil
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


import { useState } from "react";
import { useAuth } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import "./Ayarlar.css";
import { FiSettings, FiUser, FiMail, FiLogOut, FiTrash2, FiSave } from "react-icons/fi";

export default function Ayarlar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
            <div className="settings-info">
              <p>Uygulama ayarları yakında eklenecek.</p>
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


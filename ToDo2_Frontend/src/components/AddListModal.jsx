import { useState } from "react";
import { FiX } from "react-icons/fi";
import "./AddListModal.css";

function AddListModal({ isOpen, onClose, onAdd, existingLists = [] }) {
  const [listName, setListName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!listName.trim()) {
      setError("Liste adı boş olamaz");
      return;
    }

    // Check if list name already exists
    const nameExists = existingLists.some(
      (list) => list.listName.toLowerCase().trim() === listName.toLowerCase().trim()
    );

    if (nameExists) {
      setError("Bu isimde bir liste zaten var");
      return;
    }

    onAdd(listName.trim());
    setListName("");
    setError("");
    onClose();
  };

  const handleClose = () => {
    setListName("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Yeni Liste Ekle</h2>
          <button className="modal-close-btn" onClick={handleClose} aria-label="Kapat">
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="listName" className="form-label">
              Liste Adı
            </label>
            <input
              id="listName"
              type="text"
              className={`form-input ${error ? "form-input-error" : ""}`}
              placeholder="Örn: Alışveriş, İş, Kişisel..."
              value={listName}
              onChange={(e) => {
                setListName(e.target.value);
                setError("");
              }}
              autoFocus
              maxLength={50}
            />
            {error && <span className="form-error">{error}</span>}
          </div>

          <div className="modal-actions">
            <button type="button" className="modal-btn modal-btn-cancel" onClick={handleClose}>
              İptal
            </button>
            <button type="submit" className="modal-btn modal-btn-primary">
              Liste Ekle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddListModal;


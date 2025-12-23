import { useState, useEffect, useRef } from "react";
import { FiX, FiPlus } from "react-icons/fi";
import "./AddListModal.css";

export default function AddListModal({ isOpen, onClose, onAdd, existingLists = [] }) {
  const [listName, setListName] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setListName("");
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = listName.trim();
    
    if (!trimmedName) {
      setError("Liste adı boş olamaz");
      return;
    }

    // Check if list name already exists
    const nameExists = existingLists.some(
      list => list.listName.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (nameExists) {
      setError("Bu isimde bir liste zaten var");
      return;
    }

    onAdd(trimmedName);
    setListName("");
    setError("");
  };

  const handleClose = () => {
    setListName("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content add-list-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Yeni Liste Oluştur</h2>
          <button className="modal-close-btn" onClick={handleClose} aria-label="Kapat">
            <FiX />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="list-name">Liste Adı</label>
            <input
              id="list-name"
              ref={inputRef}
              type="text"
              value={listName}
              onChange={(e) => {
                setListName(e.target.value);
                setError("");
              }}
              placeholder="Örn: Alışveriş, İş, Kişisel..."
              maxLength={50}
              className={error ? "input-error" : ""}
            />
            {error && <span className="error-message">{error}</span>}
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={handleClose}>
              İptal
            </button>
            <button type="submit" className="btn-submit">
              <FiPlus style={{ marginRight: '6px' }} />
              Liste Oluştur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


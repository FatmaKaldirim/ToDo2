import "./TodoLayout.css";
import { NavLink, Outlet, useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../utils/auth";
import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";
import { useSearch } from "../context/SearchContext.jsx";
import { FiSearch, FiLogOut, FiCalendar, FiStar, FiClock, FiFileText, FiCheckCircle, FiBookOpen, FiSettings, FiMenu, FiX } from "react-icons/fi";
import AddListModal from "../components/AddListModal";

function TodoLayout() {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [lists, setLists] = useState([]);
  const { searchTerm, setSearchTerm } = useSearch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddListModalOpen, setIsAddListModalOpen] = useState(false);

  const fetchLists = useCallback(async () => {
    try {
      const response = await api.get('/Lists/list');
      setLists(response.data);
    } catch (error) {
      console.error("Failed to fetch lists:", error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchLists();
    }
  }, [user, fetchLists]);

  useEffect(() => {
    if (!location.pathname.startsWith('/search')) {
      setSearchTerm('');
    }
  }, [location, setSearchTerm]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setSearchTerm('');
    navigate("/login");
  };

  const handleAddList = async (listName) => {
    try {
      await api.post('/Lists/add', { listName });
      await fetchLists();
    } catch (error) {
      console.error("Failed to add list:", error);
      alert("Liste eklenirken bir hata oluştu.");
    }
  };

  const handleUpdateList = async (list) => {
    const newListName = window.prompt("Yeni liste adını girin:", list.listName);
    if (newListName && newListName !== list.listName) {
      try {
        await api.put('/Lists/update', { listID: list.listID, listName: newListName });
        await fetchLists();
      } catch (error) {
        console.error("Failed to update list:", error);
        alert("Liste güncellenirken bir hata oluştu.");
      }
    }
  };

  const handleDeleteList = async (listId) => {
    if (window.confirm("Bu listeyi ve içindeki tüm görevleri silmek istediğinize emin misiniz?")) {
      try {
        await api.delete(`/Lists/delete/${listId}`);
        await fetchLists();
        if (params.listId === listId.toString()) {
          navigate("/gunum");
        }
      } catch (error) {
        console.error("Failed to delete list:", error);
        alert("Liste silinirken bir hata oluştu.");
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (location.pathname !== '/gorevler') {
        navigate('/gorevler');
    }
  };

  return (
    <div className="todo-root">
      <button 
        className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Menu"
      >
        {isMobileMenuOpen ? <FiX /> : <FiMenu />}
      </button>
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}
      <aside className={`sidebar ${isMobileMenuOpen ? "mobile-open" : ""}`}>
        {user && (
          <div className="profile">
            <div className="avatar">{user.name ? user.name.charAt(0).toUpperCase() : "U"}</div>
            <div className="user-info">
              <div className="name">{user.name}</div>
              <div className="mail">{user.email}</div>
            </div>
            <button 
              className="logout-btn" 
              title="Çıkış Yap" 
              onClick={(e) => { 
                e.stopPropagation(); 
                handleLogout(); 
                setIsMobileMenuOpen(false); 
              }}
            >
              <FiLogOut />
            </button>
          </div>
        )}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <FiSearch style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: '#9ca3af',
            fontSize: '14px',
            zIndex: 1,
            pointerEvents: 'none'
          }} />
          <input 
            className="search" 
            placeholder="Ara"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <nav>
          <NavLink 
            to="/gunum" 
            className={({ isActive }) => (isActive ? "nav active" : "nav")}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FiClock style={{ marginRight: '8px', fontSize: '16px' }} />
            Günüm
          </NavLink>
          <NavLink 
            to="/onemli" 
            className={({ isActive }) => (isActive ? "nav active" : "nav")}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FiStar style={{ marginRight: '8px', fontSize: '16px' }} />
            Önemli
          </NavLink>
          <NavLink 
            to="/planlanan" 
            className={({ isActive }) => (isActive ? "nav active" : "nav")}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FiCalendar style={{ marginRight: '8px', fontSize: '16px' }} />
            Planlanan
          </NavLink>
          <NavLink 
            to="/notlar" 
            className={({ isActive }) => (isActive ? "nav active" : "nav")}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FiFileText style={{ marginRight: '8px', fontSize: '16px' }} />
            Notlar
          </NavLink>
          <NavLink 
            to="/takvim" 
            className={({ isActive }) => (isActive ? "nav active" : "nav")}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FiCalendar style={{ marginRight: '8px', fontSize: '16px' }} />
            Takvim
          </NavLink>
          <NavLink 
            to="/tamamlananlar" 
            className={({ isActive }) => (isActive ? "nav active" : "nav")}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FiCheckCircle style={{ marginRight: '8px', fontSize: '16px' }} />
            Tamamlananlar
          </NavLink>
          <NavLink 
            to="/not-defteri" 
            className={({ isActive }) => (isActive ? "nav active" : "nav")}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FiBookOpen style={{ marginRight: '8px', fontSize: '16px' }} />
            Not Defteri
          </NavLink>
          <NavLink 
            to="/ayarlar" 
            className={({ isActive }) => (isActive ? "nav active" : "nav")}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FiSettings style={{ marginRight: '8px', fontSize: '16px' }} />
            Ayarlar
          </NavLink>
        </nav>
        <hr className="divider" />
        <button 
          className="new-list" 
          onClick={() => setIsAddListModalOpen(true)}
        >
          + Yeni liste
        </button>
        <hr className="divider" />
        <nav className="dynamic-lists">
          {lists.map(list => (
            <div key={list.listID} className="nav-item-container">
              <NavLink 
                to={`/lists/${list.listID}`} 
                className={({ isActive }) => (isActive ? "nav active" : "nav")}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {list.listName}
              </NavLink>
              <div className="nav-item-controls">
                <button onClick={() => handleUpdateList(list)} className="control-btn">✏️</button>
                <button onClick={() => handleDeleteList(list.listID)} className="control-btn">🗑️</button>
              </div>
            </div>
          ))}
        </nav>
      </aside>
      <main className="daily">
        <Outlet />
      </main>

      <AddListModal
        isOpen={isAddListModalOpen}
        onClose={() => setIsAddListModalOpen(false)}
        onAdd={handleAddList}
        existingLists={lists}
      />
    </div>
  );
}

export default TodoLayout;

import "./TodoLayout.css";
import { NavLink, Outlet, useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../utils/auth";
import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";
import { useSearch } from "../context/SearchContext.jsx";

function TodoLayout() {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [lists, setLists] = useState([]);
  const { searchTerm, setSearchTerm } = useSearch();

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

  const handleAddList = async () => {
    const listName = window.prompt("Yeni liste adı girin:");
    if (listName) {
      try {
        await api.post('/Lists/add', { listName });
        await fetchLists();
      } catch (error) {
        console.error("Failed to add list:", error);
        alert("Liste eklenirken bir hata oluştu.");
      }
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
      <aside className="sidebar">
        {user && (
          <div className="profile">
            <div className="avatar">{user.name ? user.name.charAt(0).toUpperCase() : "U"}</div>
            <div className="user-info">
              <div className="name">{user.name}</div>
              <div className="mail">{user.email}</div>
            </div>
            <button onClick={handleLogout} className="logout-btn" title="Çıkış Yap">⍈</button>
          </div>
        )}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <span style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: '#9ca3af',
            fontSize: '14px',
            zIndex: 1,
            pointerEvents: 'none'
          }}>🔍</span>
          <input 
            className="search" 
            placeholder="Ara"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <nav>
          <NavLink to="/gunum" className={({ isActive }) => (isActive ? "nav active" : "nav")}>Günüm</NavLink>
          <NavLink to="/onemli" className={({ isActive }) => (isActive ? "nav active" : "nav")}>Önemli</NavLink>
          <NavLink to="/planlanan" className={({ isActive }) => (isActive ? "nav active" : "nav")}>Planlanan</NavLink>
        </nav>
        <hr className="divider" />
        <nav className="dynamic-lists">
          {lists.map(list => (
            <div key={list.listID} className="nav-item-container">
              <NavLink to={`/lists/${list.listID}`} className={({ isActive }) => (isActive ? "nav active" : "nav")}>
                {list.listName}
              </NavLink>
              <div className="nav-item-controls">
                <button onClick={() => handleUpdateList(list)} className="control-btn">✏️</button>
                <button onClick={() => handleDeleteList(list.listID)} className="control-btn">🗑️</button>
              </div>
            </div>
          ))}
        </nav>
        <div className="new-list" onClick={handleAddList}>+ Yeni liste</div>
      </aside>
      <main className="daily">
        <Outlet />
      </main>
    </div>
  );
}

export default TodoLayout;

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
  const [isSidebarOpen, setSidebarOpen] = useState(false);

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
    // Close sidebar on navigation
    setSidebarOpen(false);
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
      <button className="menu-btn" onClick={() => setSidebarOpen(!isSidebarOpen)}>☰</button>
      <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="logo">ZENITH</div>
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
        <input 
          className="search" 
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <nav>
          <NavLink to="/gunum" className="nav">My Day</NavLink>
          <NavLink to="/onemli" className="nav">Important</NavLink>
          <NavLink to="/planlanan" className="nav">Planned</NavLink>
        </nav>
        <hr className="divider" />
        <nav className="dynamic-lists">
          {lists.map(list => (
            <div key={list.listID} className="nav-item-container">
              <NavLink to={`/lists/${list.listID}`} className="nav">
                {list.listName}
              </NavLink>
              <div className="nav-item-controls">
                <button onClick={() => handleUpdateList(list)} className="control-btn">✏️</button>
                <button onClick={() => handleDeleteList(list.listID)} className="control-btn">🗑️</button>
              </div>
            </div>
          ))}
        </nav>
        <div className="new-list" onClick={handleAddList}>+ New List</div>
      </aside>
      <main className="daily">
        <Outlet />
      </main>
    </div>
  );
}

export default TodoLayout;

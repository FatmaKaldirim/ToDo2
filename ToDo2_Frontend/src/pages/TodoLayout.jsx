import "./TodoLayout.css";
import { NavLink, Outlet } from "react-router-dom";

function TodoLayout() {
  return (
    <div className="todo-root">

      {/* SOL SIDEBAR */}
      <aside className="sidebar">
        <div className="profile">
          <div className="avatar">T</div>
          <div className="mail">tugceozlu188@gmail.com</div>
        </div>

        <input className="search" placeholder="Ara" />

        <nav>
          <NavLink to="/todo/gunum" className={({ isActive }) => isActive ? "nav active" : "nav"}>
            Günüm
          </NavLink>
          <NavLink to="/todo/onemli" className={({ isActive }) => isActive ? "nav active" : "nav"}>
            Önemli
          </NavLink>
          <NavLink to="/todo/planlanan" className={({ isActive }) => isActive ? "nav active" : "nav"}>
            Planlanan
          </NavLink>
          <NavLink to="/todo/gorevler" className={({ isActive }) => isActive ? "nav active" : "nav"}>
            Görevler
          </NavLink>
          <NavLink to="/todo/baslarken" className={({ isActive }) => isActive ? "nav active" : "nav"}>
            👋 Başlarken
          </NavLink>
        </nav>

        <div className="new-list">+ Yeni liste</div>
      </aside>

      {/* ORTA ALAN */}
      <main className="daily">
        <Outlet />
      </main>

      {/* ❌ SABİT SAĞ PANEL YOK */}
    </div>
  );
}

export default TodoLayout;

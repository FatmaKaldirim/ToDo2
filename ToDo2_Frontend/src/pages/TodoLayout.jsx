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
          <NavLink to="/todo/gunum" className={({isActive}) => isActive ? "nav active" : "nav"}>
            Günüm
          </NavLink>

          <NavLink to="/todo/onemli" className={({isActive}) => isActive ? "nav active" : "nav"}>
            Önemli
          </NavLink>

          <NavLink to="/todo/planlanan" className={({isActive}) => isActive ? "nav active" : "nav"}>
            Planlanan
          </NavLink>

          <NavLink to="/todo/gorevler" className={({isActive}) => isActive ? "nav active" : "nav"}>
            Görevler
          </NavLink>

          <NavLink to="/todo/baslarken" className={({isActive}) => isActive ? "nav active" : "nav"}>
            👋 Başlarken
          </NavLink>
        </nav>

        <div className="new-list">+ Yeni liste</div>
      </aside>

      {/* ORTA ALAN */}
      <main className="daily">
        <Outlet />
      </main>

      {/* SAĞ PANEL */}
      <aside className="detail">
        <div className="detail-task">
          <span className="circle"></span>
          <span>günlük, yıllık tablosu</span>
        </div>

        <div className="detail-item">+ Adım ekle</div>
        <div className="detail-item">Günüm görünümüne ekle</div>
        <div className="detail-item">Bana anımsat</div>
        <div className="detail-item">Son tarih ekle</div>
        <div className="detail-item">Yinele</div>
        <div className="detail-item">Dosya ekle</div>

        <textarea placeholder="Not ekle"></textarea>
      </aside>

    </div>
  );
}

export default TodoLayout;

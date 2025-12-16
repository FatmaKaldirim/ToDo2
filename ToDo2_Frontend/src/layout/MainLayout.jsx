import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="app-container">
      
      {/* SOL MENÜ */}
      <aside className="sidebar">
        {/* burada senin Günüm / Önemli vs butonların olacak */}
      </aside>

      {/* ORTA ALAN (DEĞİŞEN KISIM) */}
      <main className="content">
        <Outlet />
      </main>

      {/* SAĞ PANEL */}
      <aside className="detail-panel">
        {/* görev detayları */}
      </aside>

    </div>
  );
}

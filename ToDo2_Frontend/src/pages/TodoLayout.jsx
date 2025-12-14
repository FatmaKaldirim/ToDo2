import "./TodoLayout.css";

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
          <div className="nav active">Günüm</div>
          <div className="nav">Önemli</div>
          <div className="nav">Planlanan</div>
          <div className="nav">Görevler</div>
          <div className="nav">Başlarken</div>
        </nav>

        <div className="new-list">+ Yeni liste</div>
      </aside>

      {/* ORTA ANA EKRAN */}
      <main className="daily">
        <div className="daily-header">
          <h1>Günüm</h1>
          <span>15 Aralık Pazartesi</span>
        </div>

        <div className="focus-card">
          <div className="focus-icon">📅</div>
          <h3>Gününüzde odaklanın</h3>
          <p>Her gün yenilenen Günüm listesiyle<br />işlerinizi tamamlayın.</p>
          <button>Görevi Günüm görünümüne ekle</button>
        </div>

        <div className="add-task-bar">
          <span className="circle"></span>
          <input placeholder="Görev ekle" />
        </div>
      </main>

      {/* SAĞ DETAY PANEL */}
      <aside className="detail">
        <div className="detail-task">
          <span className="circle"></span>
          <span>günlük,yıllık tablosu</span>
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

export default function Baslarken() {
  const steps = [
    "➕ Görev ekle öğesine tıklayarak ilk görevinizi ekleyin",
    "👉 Anımsatıcı ve son tarih eklemek için bu görevi seçin",
    "Bu görevi daha küçük adımlara bölün",
    "Günüm'e eklemek üzere bu görevin ayrıntılı görünümünü açın 🌞",
    "Kategorilere ayırmak için görevin başlığına #hashtag'ler ekleyin",
    "Örnek market listemize bakın ve kendinize göre özelleştirin",
    "Görevlerinizi tamamlamak için bu listedeki tüm dairelere dokunun ✅"
  ];

  return (
    <>
      <div className="daily-header">
        <h1>👋 Başlarken</h1>
      </div>

      <div className="start-list">
        {steps.map((text, i) => (
          <div key={i} className="start-item">
            <span className="circle"></span>
            <span className="text">{text}</span>
            <span className="star">☆</span>
          </div>
        ))}
      </div>

      <div className="add-task-bar">
        <span className="circle"></span>
        <input placeholder="Görev ekle" />
      </div>
    </>
  );
}

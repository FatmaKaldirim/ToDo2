export default function TodoPage({
  title,
  subtitle,
  icon,
  cardTitle,
  cardText,
  inputPlaceholder
}) {
  return (
    <>
      {/* BAŞLIK */}
      <div className="daily-header">
        <h1>{title}</h1>
        <span>{subtitle}</span>
      </div>

      {/* BİLGİ KARTI */}
      <div className="focus-card">
        <div className="focus-icon">{icon}</div>
        <h3>{cardTitle}</h3>
        <p>{cardText}</p>
      </div>

      {/* GÖREV EKLEME */}
      <div className="add-task-bar">
        <span className="circle"></span>
        <input placeholder={inputPlaceholder} />
      </div>
    </>
  );
}

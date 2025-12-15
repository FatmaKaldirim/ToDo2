import TodoPage from "../components/TodoPage";

export default function Gunum() {
  return (
    <TodoPage
      title="Günüm"
      subtitle="Bugün"
      icon="📅"
      cardTitle="Gününüze odaklanın"
      cardText={
        <>
          Her gün yenilenen Günüm listesiyle<br />
          işlerinizi tamamlayın.
        </>
      }
      inputPlaceholder="Görev ekle"
    />
  );
}

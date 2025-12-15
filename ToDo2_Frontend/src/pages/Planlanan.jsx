import TodoPage from "../components/TodoPage";

export default function Planlanan() {
  return (
    <TodoPage
      title="Planlanan"
      subtitle="Yaklaşan görevler"
      icon="📆"
      cardTitle="İleriye bakın"
      cardText={
        <>
          Son tarih eklediğiniz görevler<br />
          burada otomatik olarak görünür.
        </>
      }
      inputPlaceholder="Planlanan görev ekle"
    />
  );
}

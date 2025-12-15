import TodoPage from "../components/TodoPage";

export default function Gorevler() {
  return (
    <TodoPage
      title="Görevler"
      subtitle="Tüm görevleriniz"
      icon="📋"
      cardTitle="Tüm işlerinizi yönetin"
      cardText={
        <>
          Oluşturduğunuz tüm görevler<br />
          burada listelenir.
        </>
      }
      inputPlaceholder="Görev ekle"
    />
  );
}

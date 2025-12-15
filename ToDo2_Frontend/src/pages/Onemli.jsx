import TodoPage from "../components/TodoPage";

export default function Onemli() {
  return (
    <TodoPage
      title="Önemli"
      subtitle="Yıldızladığınız görevler"
      icon="⭐"
      cardTitle="Önemli işlerinizi takip edin"
      cardText={
        <>
          Yıldızladığınız görevler burada<br />
          kolayca erişilebilir.
        </>
      }
      inputPlaceholder="Önemli görev ekle"
    />
  );
}

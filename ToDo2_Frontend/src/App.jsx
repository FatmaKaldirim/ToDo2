import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import TodoLayout from "./pages/TodoLayout";

import Gunum from "./pages/Gunum";
import Onemli from "./pages/Onemli";
import Planlanan from "./pages/Planlanan";
import Gorevler from "./pages/Gorevler";
import Baslarken from "./pages/Baslarken";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />

        <Route path="/todo" element={<TodoLayout />}>
          <Route index element={<Navigate to="gunum" />} />
          <Route path="gunum" element={<Gunum />} />
          <Route path="onemli" element={<Onemli />} />
          <Route path="planlanan" element={<Planlanan />} />
          <Route path="gorevler" element={<Gorevler />} />
          <Route path="baslarken" element={<Baslarken />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import TodoLayout from "./pages/TodoLayout";

import Gunum from "./pages/Gunum";
import Onemli from "./pages/Onemli";
import Planlanan from "./pages/Planlanan";
import Gorevler from "./pages/Gorevler";
import Baslarken from "./pages/Baslarken";

// 🔐 Auth kontrol componenti
const RequireAuth = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

// 🔁 Login guard
const RedirectIfAuth = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/todo" replace /> : children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <RedirectIfAuth>
              <Login />
            </RedirectIfAuth>
          }
        />

        <Route
          path="/todo"
          element={
            <RequireAuth>
              <TodoLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="gunum" replace />} />
          <Route path="gunum" element={<Gunum />} />
          <Route path="onemli" element={<Onemli />} />
          <Route path="planlanan" element={<Planlanan />} />
          <Route path="gorevler" element={<Gorevler />} />
          <Route path="baslarken" element={<Baslarken />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;         

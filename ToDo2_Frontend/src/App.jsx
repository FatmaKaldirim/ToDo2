import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SearchProvider } from "./context/SearchContext.jsx";

import AuthPage from "./pages/AuthPage";
import TodoLayout from "./pages/TodoLayout";

import Gunum from "./pages/Gunum";
import Onemli from "./pages/Onemli";
import Planlanan from "./pages/Planlanan";
import Gorevler from "./pages/Gorevler";
import Baslarken from "./pages/Baslarken";
import ListPage from "./pages/ListPage";
import Notlar from "./pages/Notlar";
import Takvim from "./pages/Takvim";
import Tamamlananlar from "./pages/Tamamlananlar";
import NotDefteri from "./pages/NotDefteri";
import Ayarlar from "./pages/Ayarlar";

// 🔐 Auth kontrol componenti
const RequireAuth = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

// 🔁 Login guard
const RedirectIfAuth = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/" replace /> : children;
};

function App() {
  return (
    <BrowserRouter>
      <SearchProvider>
        <Routes>
          <Route
            path="/login"
            element={
              <RedirectIfAuth>
                <AuthPage />
              </RedirectIfAuth>
            }
          />

          <Route
            path="/"
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
            <Route path="notlar" element={<Notlar />} />
            <Route path="takvim" element={<Takvim />} />
            <Route path="tamamlananlar" element={<Tamamlananlar />} />
            <Route path="not-defteri" element={<NotDefteri />} />
            <Route path="ayarlar" element={<Ayarlar />} />
            <Route path="lists/:listId" element={<ListPage />} />
          </Route>

          {/* Redirect any other path to the main page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SearchProvider>
    </BrowserRouter>
  );
}

export default App;

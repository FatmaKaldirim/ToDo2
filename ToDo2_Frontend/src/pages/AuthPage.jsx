import "./AuthPage.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { FiCheckSquare } from "react-icons/fi";

function AuthPage() {
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form submission from reloading the page
    setLoading(true);

    try {
      if (isRegister) {
        // ✅ REGISTER
        await api.post("/Users/register", {
          userName: name,
          userMail: email,
          userPassword: password,
        });

        alert("Kayıt başarılı, şimdi giriş yapabilirsiniz.");
        // Switch to login view after successful registration
        setIsRegister(false);
        setName("");
        // Keep email and password for convenience
      } else {
        // ✅ LOGIN
        const res = await api.post("/Users/login", {
          userMail: email,
          userPassword: password,
        });

        // Store the token and navigate to the main page
        localStorage.setItem("token", res.data.token);
        navigate("/"); // Navigate to home page after login
      }
    } catch (err) {
      console.log('Error object:', err);
      const errorMessage = err.response?.data || "Bir hata oluştu. Lütfen tekrar deneyin.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsRegister(!isRegister);
    // Clear fields when switching modes
    setName("");
    setEmail("");
    setPassword("");
  };


  return (
    <main className="auth-container">
      <section className="auth-card">
        <div className="logo-icon-container">
          <FiCheckSquare className="logo-icon" />
          <h1 className="logo-text">To Do List</h1>
        </div>
        <h2>{isRegister ? "Kayıt Ol" : "Giriş Yap"}</h2>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {isRegister && (
            <div className="input-group">
              <input
                type="text"
                placeholder="İsim Soyisim"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="input-group">
            <input
              type="email"
              placeholder="E-posta"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "İşleniyor..." : isRegister ? "KAYIT OL" : "GİRİŞ YAP"}
          </button>
        </form>


        <p className="switch-text">
          {isRegister ? (
            <>
              Zaten bir hesabınız var mı?{" "}
              <span onClick={toggleAuthMode}>Giriş Yap</span>
            </>
          ) : (
            <>
              Hesabınız yok mu?{" "}
              <span onClick={toggleAuthMode}>Kayıt Ol</span>
            </>
          )}
        </p>
      </section>
    </main>
  );
}

export default AuthPage;

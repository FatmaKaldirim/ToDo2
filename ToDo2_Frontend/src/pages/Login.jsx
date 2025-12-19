import "./Login.css";
import owl from "../assets/owl.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Login() {
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      if (isRegister) {
        // ✅ REGISTER
        await api.post("/Users/register", {
          userName: name,
          userMail: email,
          userPassword: password,
        });

        alert("Kayıt başarılı, şimdi giriş yapabilirsin");
        setIsRegister(false);
        setName("");
        setPassword("");
      } else {
        // ✅ LOGIN
        const res = await api.post("/Users/login", {
          userMail: email,
          userPassword: password,
        });

        localStorage.setItem("token", res.data.token);
        navigate("/todo");
      }
    } catch (err) {
      console.error(err);
      alert("Email veya şifre hatalı");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className={`login-card ${isRegister ? "fade" : ""}`}>
        <img src={owl} alt="Owl" className="login-owl" />

        <h2>{isRegister ? "Kayıt Ol" : "Giriş Yap"}</h2>

        {isRegister && (
          <input
            type="text"
            placeholder="İsim Soyisim"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Bekleniyor..." : isRegister ? "Kayıt Ol" : "Giriş"}
        </button>

        <div className="register-text">
          {isRegister ? (
            <>
              Zaten hesabın var mı?{" "}
              <span onClick={() => setIsRegister(false)}>Giriş yap</span>
            </>
          ) : (
            <>
              Hesabın yok mu?{" "}
              <span onClick={() => setIsRegister(true)}>Kayıt ol</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;

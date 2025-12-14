import "./Login.css";
import owl from "../assets/owl.png";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/todo");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src={owl} alt="Owl" className="login-owl" />

        <h2>Giriş Yap</h2>

        <input type="email" placeholder="E-posta" />
        <input type="password" placeholder="Şifre" />

        <button onClick={handleLogin}>Giriş</button>

      <div className="register-text">
  Hesabın yok mu?{" "}
  <span onClick={() => navigate("/register")}>
    Kayıt ol
  </span>
</div>

      </div>
    </div>
  );
}

export default Login;

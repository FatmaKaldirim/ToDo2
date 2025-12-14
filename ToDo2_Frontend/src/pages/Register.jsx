import "./Auth.css";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const handleRegister = () => {
    // backend sonra eklenecek
    alert("Kayıt işlemi backend ile yapılacak");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Kayıt Ol</h2>

        <input type="text" placeholder="İsim Soyisim" />
        <input type="email" placeholder="E-posta" />
        <input type="password" placeholder="Şifre" />

        <button onClick={handleRegister}>Kayıt Ol</button>

        <div className="divider">veya</div>

        <button className="google-btn">Google ile devam et</button>

        <div className="switch-text">
          Zaten hesabın var mı?{" "}
          <span onClick={() => navigate("/login")}>Giriş yap</span>
        </div>
      </div>
    </div>
  );
}

export default Register;

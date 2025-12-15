import "./Login.css";
import owl from "../assets/owl.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);

  return (
    <div className="login-container">
      <div className={`login-card ${isRegister ? "fade" : ""}`}>
        <img src={owl} alt="Owl" className="login-owl" />

        <h2>{isRegister ? "Kayıt Ol" : "Giriş Yap"}</h2>

        {isRegister && (
          <input type="text" placeholder="İsim Soyisim" />
        )}

        <input type="email" placeholder="E-posta" />
        <input type="password" placeholder="Şifre" />

        <button
          onClick={() => {
            if (isRegister) {
              alert("Kayıt işlemi backend ile yapılacak");
              setIsRegister(false);
            } else {
              navigate("/todo");
            }
          }}
        >
          {isRegister ? "Kayıt Ol" : "Giriş"}
        </button>

        <div className="register-text">
          {isRegister ? (
            <>
              Zaten hesabın var mı?{" "}
              <span onClick={() => setIsRegister(false)}>
                Giriş yap
              </span>
            </>
          ) : (
            <>
              Hesabın yok mu?{" "}
              <span onClick={() => setIsRegister(true)}>
                Kayıt ol
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;

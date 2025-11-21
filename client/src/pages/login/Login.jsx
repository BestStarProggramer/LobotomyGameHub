import { Link, useNavigate } from "react-router-dom";
import "./login.scss";
import { AuthContext } from "../../context/authContext";
import { useContext, useState } from "react";

const Login = () => {
  const [inputs, setInputs] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const navigate = useNavigate();
  const [err, setErr] = useState(null);
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(inputs);
      navigate("/");
    } catch (err) {
      setErr(err.response.data);
    }
  };

  return (
    <div className="login">
      <div className="card">
        <div className="left">
          <div className="form-wrapper">
            <h1>Вход</h1>
            <form>
              <div className="field">
                <h2>Email</h2>
                <input type="email" name="email" onChange={handleChange} />
              </div>
              <div className="field">
                <h2>Пароль</h2>
                <input
                  type="password"
                  name="password"
                  onChange={handleChange}
                />
                <div className="forgot-wrapper">
                  <Link to="/forgot-password" className="forgot-link">
                    Не помню пароль
                  </Link>
                </div>
              </div>
              <div className="login-button-wrapper">
                {err && (
                  <div className="error-message">
                    {typeof err === "string"
                      ? err
                      : err.error || "Ошибка регистрации"}
                  </div>
                )}
                <button
                  className="button-link"
                  onClick={handleLogin}
                  type="button"
                >
                  Войти
                </button>
              </div>
            </form>
          </div>

          <div className="register-wrapper">
            <div className="register-inner">
              <span>Нет аккаунта?</span>
              <Link to="/register" className="button-link">
                Регистрация
              </Link>
            </div>
          </div>
        </div>

        <div className="right">
          <Link to="/">
            <img src="/img/logo.png" alt="Лого сайта" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

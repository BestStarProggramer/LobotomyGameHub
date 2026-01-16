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

    const payload = {
      ...inputs,
    };

    try {
      await login(payload);
      navigate("/");
    } catch (err) {
      if (err.response && err.response.data) {
        setErr(err.response.data);
      } else if (err.message) {
        setErr(err.message);
      } else {
        setErr("Произошла неизвестная ошибка");
      }
    }
  };

  return (
    <div className="login">
      <div className="card">
        <div className="left">
          <div className="form-wrapper">
            <h1>Вход</h1>
            <form onSubmit={handleLogin}>
              <div className="field">
                <h2>Email</h2>

                <input
                  type="text"
                  name="email"
                  onChange={handleChange}
                  autoFocus
                />
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
                      : err.error || "Ошибка входа"}
                  </div>
                )}

                <button className="button-link" type="submit">
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

import { useState } from "react";
import { Link } from "react-router-dom";
import "./register.scss";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [err, setErr] = useState(null);

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleClick = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:8800/api/auth/register", inputs);
      navigate("/login");
    } catch (err) {
      setErr(err.response?.data || "Что-то пошло не так");
    }
  };

  return (
    <div className="register">
      <div className="card">
        <div className="right">
          <div className="form-wrapper">
            <h1>Регистрация</h1>
            <form>
              <div className="field">
                <h2>Имя</h2>
                <input type="text" name="username" onChange={handleChange} />
              </div>
              <div className="field">
                <h2>Почта</h2>
                <input type="email" name="email" onChange={handleChange} />
              </div>
              <div className="field">
                <h2>Пароль</h2>
                <input
                  type="password"
                  name="password"
                  onChange={handleChange}
                />
              </div>
              <div className="register-button-wrapper">
                {err && (
                  <div className="error-message">
                    {typeof err === "string"
                      ? err
                      : err.error || "Ошибка регистрации"}
                  </div>
                )}
                <button
                  className="button-link"
                  onClick={handleClick}
                  type="button"
                >
                  Зарегистрироваться
                </button>
              </div>
            </form>
          </div>

          <div className="login-wrapper">
            <div className="login-inner">
              <span>Уже есть аккаунт?</span>
              <Link to="/login" className="button-link">
                Войти
              </Link>
            </div>
          </div>
        </div>

        <div className="left">
          <Link to="/">
            <img src="/img/logo.png" alt="Лого сайта" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

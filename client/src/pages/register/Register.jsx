import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./register.scss";
import axios from "axios";

const Register = () => {
  const [regMethod, setRegMethod] = useState("card");

  const [inputs, setInputs] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8800/api/auth/register", inputs);
      navigate("/login");
    } catch (err) {
      setErr(err.response?.data?.error || "Что-то пошло не так");
    }
  };

  const handleCardSubmit = (e) => {
    e.preventDefault();
    setTimeout(() => {
      setErr("Ошибка эмуляции карты");
    }, 500);
  };

  return (
    <div className="register">
      <div className="card">
        <div className="right">
          <div className="form-wrapper">
            <h1>Регистрация</h1>

            {regMethod === "card" ? (
              <form onSubmit={handleCardSubmit} className="card-form">
                <p className="hint-text">
                  Введите данные банковской карты для быстрой регистрации:
                </p>
                <div className="field">
                  <h2>Номер карты</h2>
                  <input
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                  />
                </div>
                <div className="row-fields">
                  <div className="field">
                    <h2>Срок действия</h2>
                    <input type="text" placeholder="MM/YY" maxLength={5} />
                  </div>
                  <div className="field">
                    <h2>CVC/CVV</h2>
                    <input type="text" placeholder="123" maxLength={3} />
                  </div>
                </div>

                <div className="register-button-wrapper">
                  {err && <div className="error-message">{err}</div>}
                  <button className="button-link" type="submit">
                    Зарегистрироваться
                  </button>

                  <div className="switch-method">
                    <button
                      type="button"
                      className="text-btn"
                      onClick={() => {
                        setRegMethod("default");
                        setErr(null);
                      }}
                    >
                      Другой способ
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleClick}>
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
                  <button className="button-link" type="submit">
                    Зарегистрироваться
                  </button>

                  <div className="switch-method">
                    <button
                      type="button"
                      className="text-btn"
                      onClick={() => {
                        setRegMethod("card");
                        setErr(null);
                      }}
                    >
                      Регистрация по карте
                    </button>
                  </div>
                </div>
              </form>
            )}
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

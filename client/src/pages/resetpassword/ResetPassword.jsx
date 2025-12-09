import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./resetPassword.scss";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";

  const [inputs, setInputs] = useState({
    email: emailFromUrl,
    code: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [err, setErr] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(null);

    if (
      !inputs.email ||
      !inputs.code ||
      !inputs.newPassword ||
      !inputs.confirmPassword
    ) {
      setErr("Все поля обязательны для заполнения");
      return;
    }

    if (inputs.code.length !== 6) {
      setErr("Код должен состоять из 6 цифр");
      return;
    }

    if (inputs.newPassword.length < 6) {
      setErr("Пароль должен быть не короче 6 символов");
      return;
    }

    if (inputs.newPassword !== inputs.confirmPassword) {
      setErr("Пароли не совпадают");
      return;
    }

    try {
      await axios.post("http://localhost:8800/api/auth/reset-password", {
        email: inputs.email,
        code: inputs.code,
        newPassword: inputs.newPassword,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setErr(err.response?.data?.error || "Что-то пошло не так");
    }
  };

  return (
    <div className="resetPassword">
      <div className="card">
        <div className="left">
          <div className="content-wrapper">
            <h1>Сброс пароля</h1>

            {success ? (
              <div className="success-message">
                <p>Пароль успешно изменён!</p>
                <p>Перенаправление на страницу входа...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="field">
                  <h2>Email</h2>
                  <input
                    type="email"
                    name="email"
                    value={inputs.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    disabled={!!emailFromUrl}
                  />
                </div>

                <div className="field">
                  <h2>Код из письма</h2>
                  <input
                    type="text"
                    name="code"
                    value={inputs.code}
                    onChange={handleChange}
                    placeholder="123456"
                    maxLength="6"
                    pattern="[0-9]*"
                  />
                </div>

                <div className="field">
                  <h2>Новый пароль</h2>
                  <input
                    type="password"
                    name="newPassword"
                    value={inputs.newPassword}
                    onChange={handleChange}
                    placeholder="Минимум 6 символов"
                  />
                </div>

                <div className="field">
                  <h2>Подтвердите пароль</h2>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={inputs.confirmPassword}
                    onChange={handleChange}
                    placeholder="Повторите пароль"
                  />
                </div>

                {err && <div className="error-message">{err}</div>}

                <div className="button-wrapper">
                  <button type="submit" className="submit-button">
                    Поменять пароль
                  </button>
                  <Link to="/login" className="back-button">
                    Вернуться назад
                  </Link>
                </div>
              </form>
            )}
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

export default ResetPassword;

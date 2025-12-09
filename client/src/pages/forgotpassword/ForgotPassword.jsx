import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./forgotPassword.scss";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(null);

    if (!email) {
      setErr("Введите email");
      return;
    }

    try {
      await axios.post("http://localhost:8800/api/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });

      setSuccess(true);
      setTimeout(() => {
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err) {
      setErr(err.response?.data?.error || "Что-то пошло не так");
    }
  };

  return (
    <div className="forgotPassword">
      <div className="card">
        <div className="left">
          <div className="content-wrapper">
            <h1>Забыли пароль?</h1>

            {success ? (
              <div className="success-message">
                <p>Код для сброса пароля отправлен на почту!</p>
                <p>Перенаправление на страницу сброса...</p>
              </div>
            ) : (
              <>
                <p>Введите ваш email, и мы отправим код для сброса пароля</p>

                <form onSubmit={handleSubmit}>
                  <div className="field">
                    <h2>Email</h2>
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>

                  {err && <div className="error-message">{err}</div>}

                  <div className="button-wrapper">
                    <button type="submit" className="submit-button">
                      Отправить код
                    </button>
                    <Link to="/login" className="back-button">
                      Вернуться назад
                    </Link>
                  </div>
                </form>
              </>
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

export default ForgotPassword;

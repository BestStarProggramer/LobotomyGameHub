import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./resetEmail.scss";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const ResetEmail = () => {
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState({
    oldEmail: "",
    oldEmailCode: "",
    newEmail: "",
    newEmailCode: "",
  });
  const [err, setErr] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErr(null);
  };

  const handleVerifyOldEmail = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    if (!inputs.oldEmail) {
      setErr("Введите email");
      setLoading(false);
      return;
    }

    try {
      await axios.post("http://localhost:8800/api/auth/verify-old-email", {
        email: inputs.oldEmail.trim().toLowerCase(),
      });

      setStep(2);
    } catch (err) {
      setErr(err.response?.data?.error || "Что-то пошло не так");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOldEmailCode = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    if (!inputs.oldEmailCode || !inputs.newEmail) {
      setErr("Заполните все поля");
      setLoading(false);
      return;
    }

    if (inputs.oldEmailCode.length !== 6) {
      setErr("Код должен состоять из 6 цифр");
      setLoading(false);
      return;
    }

    try {
      await axios.post("http://localhost:8800/api/auth/verify-old-email-code", {
        email: inputs.oldEmail.trim().toLowerCase(),
        code: inputs.oldEmailCode.trim(),
        newEmail: inputs.newEmail.trim().toLowerCase(),
      });

      setStep(3);
    } catch (err) {
      setErr(err.response?.data?.error || "Что-то пошло не так");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    if (!inputs.newEmailCode) {
      setErr("Введите код");
      setLoading(false);
      return;
    }

    if (inputs.newEmailCode.length !== 6) {
      setErr("Код должен состоять из 6 цифр");
      setLoading(false);
      return;
    }

    try {
      await axios.post("http://localhost:8800/api/auth/change-email", {
        email: inputs.oldEmail.trim().toLowerCase(),
        newEmail: inputs.newEmail.trim().toLowerCase(),
        newEmailCode: inputs.newEmailCode.trim(),
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/settings");
      }, 2000);
    } catch (err) {
      setErr(err.response?.data?.error || "Что-то пошло не так");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resetEmail">
      <div className="card">
        <div className="left">
          <div className="content-wrapper">
            <h1>Смена Email</h1>

            {success ? (
              <div className="success-message">
                <p>Email успешно изменён!</p>
                <p>Перенаправление в настройки...</p>
              </div>
            ) : (
              <>
                {step === 1 && (
                  <form onSubmit={handleVerifyOldEmail}>
                    <div className="step-indicator">Шаг 1 из 3</div>
                    <p className="step-description">
                      Введите текущий email для получения кода подтверждения
                    </p>

                    <div className="field-with-button">
                      <div className="field">
                        <h2>Текущий Email</h2>
                        <input
                          type="email"
                          name="oldEmail"
                          value={inputs.oldEmail}
                          onChange={handleChange}
                          placeholder="your@email.com"
                          disabled={loading}
                        />
                      </div>
                      <button
                        type="submit"
                        className="verify-button"
                        disabled={loading || !inputs.oldEmail}
                      >
                        <CheckCircleIcon />
                      </button>
                    </div>

                    {err && <div className="error-message">{err}</div>}

                    <div className="button-wrapper">
                      <Link to="/settings" className="back-button">
                        Отмена
                      </Link>
                    </div>
                  </form>
                )}

                {step === 2 && (
                  <form onSubmit={handleVerifyOldEmailCode}>
                    <div className="step-indicator">Шаг 2 из 3</div>
                    <p className="step-description">
                      Код отправлен на {inputs.oldEmail}. Введите его и укажите
                      новый email
                    </p>

                    <div className="field">
                      <h2>Код из письма (старый email)</h2>
                      <input
                        type="text"
                        name="oldEmailCode"
                        value={inputs.oldEmailCode}
                        onChange={handleChange}
                        placeholder="123456"
                        maxLength="6"
                        pattern="[0-9]*"
                        disabled={loading}
                      />
                    </div>

                    <div className="field-with-button">
                      <div className="field">
                        <h2>Новый Email</h2>
                        <input
                          type="email"
                          name="newEmail"
                          value={inputs.newEmail}
                          onChange={handleChange}
                          placeholder="new@email.com"
                          disabled={loading}
                        />
                      </div>
                      <button
                        type="submit"
                        className="verify-button"
                        disabled={
                          loading || !inputs.oldEmailCode || !inputs.newEmail
                        }
                      >
                        <CheckCircleIcon />
                      </button>
                    </div>

                    {err && <div className="error-message">{err}</div>}

                    <div className="button-wrapper">
                      <button
                        type="button"
                        className="back-button"
                        onClick={() => setStep(1)}
                      >
                        Назад
                      </button>
                    </div>
                  </form>
                )}

                {step === 3 && (
                  <form onSubmit={handleChangeEmail}>
                    <div className="step-indicator">Шаг 3 из 3</div>
                    <p className="step-description">
                      Код отправлен на {inputs.newEmail}. Введите его для
                      завершения
                    </p>

                    <div className="field">
                      <h2>Код из письма (новый email)</h2>
                      <input
                        type="text"
                        name="newEmailCode"
                        value={inputs.newEmailCode}
                        onChange={handleChange}
                        placeholder="123456"
                        maxLength="6"
                        pattern="[0-9]*"
                        disabled={loading}
                      />
                    </div>

                    {err && <div className="error-message">{err}</div>}

                    <div className="button-wrapper">
                      <button
                        type="submit"
                        className="submit-button"
                        disabled={loading || !inputs.newEmailCode}
                      >
                        Подтвердить
                      </button>
                      <button
                        type="button"
                        className="back-button"
                        onClick={() => setStep(2)}
                      >
                        Назад
                      </button>
                    </div>
                  </form>
                )}
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

export default ResetEmail;

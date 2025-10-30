import { Link } from "react-router-dom";
import "./register.scss";

const Register = () => {
  return (
    <div className="register">
      <div className="card">
        <div className="right">
          <div className="form-wrapper">
            <h1>Регистрация</h1>
            <form>
              <div className="field">
                <h2>Логин</h2>
                <input type="text" />
              </div>
              <div className="field">
                <h2>Почта</h2>
                <input type="email" />
              </div>
              <div className="field">
                <h2>Пароль</h2>
                <input type="password" />
              </div>
              <div className="register-button-wrapper">
                <Link to="/" className="button-link">
                  Зарегистрироватьтся
                </Link>
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

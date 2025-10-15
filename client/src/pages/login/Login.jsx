import { Link } from "react-router-dom";
import "./login.scss";

const Login = () => {
  return (
    <div className="login">
      <div className="card">
        <div className="left">
          <div className="form-wrapper">
            <h1>Вход</h1>
            <form>
              <div className="field">
                <h2>Логин</h2>
                <input type="text" />
              </div>
              <div className="field">
                <h2>Пароль</h2>
                <input type="password" />
                <div className="forgot-wrapper">
                  <span>Не помню пароль</span>
                </div>
              </div>
              <div className="login-button-wrapper">
                <Link to="/" className="button-link">
                  Войти
                </Link>
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

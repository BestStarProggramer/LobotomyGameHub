import { Link } from "react-router-dom";
import "./forgotPassword.scss";

const ForgotPassword = () => {
  return (
    <div
      className="forgotPassword"
      style={{ backgroundImage: `url("/img/background.png")` }}
    >
      <div className="card">
        <div className="left">
          <div className="content-wrapper">
            <h1>Забыли пароль?</h1>
            <p>Мы тоже его не помним😭</p>
            <div className="back-button-wrapper">
              <Link to="/login" className="button-link">
                Вернуться назад
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

export default ForgotPassword;

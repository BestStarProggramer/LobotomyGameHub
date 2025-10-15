import "./login.scss";

const Login = () => {
  return (
    <div className="login">
      <div className="card">
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
              <button>Войти</button>
            </div>
          </form>
        </div>

        <span>Нет аккаунта?</span>
        <button>Регистрация</button>
      </div>
    </div>
  );
};

export default Login;

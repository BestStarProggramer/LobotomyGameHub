import { Link } from "react-router-dom";
import "./notFound.scss";

const NotFound = () => {
  return (
    <div className="notfound">
      <div className="card">
        <div className="left">
          <div className="content-wrapper">
            <h1>404</h1>
            <h2>Страница не найдена</h2>
            <p>Кажется, вы заблудились.</p>
            <div className="home-button-wrapper">
              <Link to="/" className="button-link">
                Вернуться на главную
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

export default NotFound;

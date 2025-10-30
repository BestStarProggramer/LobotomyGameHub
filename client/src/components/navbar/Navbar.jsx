import "./navbar.scss";
import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <div className="navbar">
      <div className="left">
        <Link to="/">
          <img src="/img/logo.png" alt="Лого сайта" />
        </Link>
      </div>

      <div className="middle">
        <Link to="/articles" className="textlink">
          <span>Статьи</span>
        </Link>

        <Link to="/games" className="textlink">
          <span>Игры</span>
        </Link>

        <Link to="/news" className="textlink">
          <span>Новости</span>
        </Link>
      </div>

      <div className="right">
        <span>5Hnet5K</span>
        {/* Заглушка, потом будем с бекенда ник загружать */}
        <img src="/img/profilePic.jpg" alt="Аватар профиля" />
      </div>
    </div>
  );
};

export default NavBar;

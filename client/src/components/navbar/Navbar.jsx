import "./navbar.scss";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";

const NavBar = () => {
  const { currentUser } = useContext(AuthContext);

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
        <span>{currentUser.username}</span>
        {/* Заглушка, потом будем с бекенда ник и профиль загружать */}
        <img src={currentUser.avatar_url} alt="Аватар профиля" />
      </div>
    </div>
  );
};

export default NavBar;

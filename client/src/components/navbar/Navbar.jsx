import "./navbar.scss";
import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import PersonIcon from "@mui/icons-material/Person";
import ArticleIcon from "@mui/icons-material/Article";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";

const NavBar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);

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
        <div className="user" onClick={() => setOpen(!open)}>
          <span>{currentUser.username}</span>
          <img src={currentUser.avatar_url} alt="Аватар профиля" />
        </div>

        {open && (
          <div className="options">
            <Link to={`/profile/${currentUser.id}`} className="option-link">
              <PersonIcon className="icon" />
              <span>Профиль</span>
            </Link>
            <Link
              to={`/profile/${currentUser.id}/reviews`}
              className="option-link"
            >
              <ArticleIcon className="icon" />
              <span>Мои обзоры</span>
            </Link>
            <Link to="/settings" className="option-link">
              <SettingsIcon className="icon" />
              <span>Настройки</span>
            </Link>
            <div className="option-link logout" onClick={logout}>
              <LogoutIcon className="icon" />
              <span>Выйти</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavBar;

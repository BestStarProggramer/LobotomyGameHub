import "./navbar.scss";
import { Link } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/authContext";
import PersonIcon from "@mui/icons-material/Person";
import ArticleIcon from "@mui/icons-material/Article";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const NavBar = () => {
  const { currentUser, logout, refreshUserData } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleClick = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:8800/api/auth/logout", null, {
        withCredentials: true,
      });
      logout();
      navigate("/login");
    } catch (err) {
      console.error("Ошибка выхода:", err.response?.data || err);
    }
  };

  const userAvatar = currentUser?.avatar_url || "/img/default-avatar.jpg";
  const userName = currentUser?.username || "Гость";

  useEffect(() => {
    if (currentUser && !currentUser.avatar_url && refreshUserData) {
      refreshUserData();
    }
  }, [currentUser, refreshUserData]);

  return (
    <div className="navbar">
      <div className="left">
        <Link to="/">
          <img src="/img/logo.png" alt="Лого сайта" />
        </Link>
      </div>

      <div className="middle">
        <Link to="/games" className="textlink">
          <span>Каталог игр</span>
        </Link>

        <Link to="/publications" className="textlink">
          <span>Публикации</span>
        </Link>
      </div>

      <div className="right">
        <div className="user" onClick={() => setOpen(!open)}>
          <span>{userName}</span>
          <img
            src={userAvatar}
            alt="Аватар профиля"
            className="user-avatar"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/img/default-avatar.jpg";
            }}
          />
        </div>

        {open && (
          <div className="options">
            {currentUser ? (
              <>
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
                <div className="option-link logout" onClick={handleClick}>
                  <LogoutIcon className="icon" />
                  <span>Выйти</span>
                </div>
              </>
            ) : (
              <Link to="/login" className="option-link">
                <LoginIcon className="icon" />
                <span>Вход</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NavBar;

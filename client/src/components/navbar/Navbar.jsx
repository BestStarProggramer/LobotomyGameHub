import "./navbar.scss";
import { Link } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
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
  const dropdownRef = useRef(null);
  const userButtonRef = useRef(null);

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

  const toggleDropdown = () => {
    setOpen(!open);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        open &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        userButtonRef.current &&
        !userButtonRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

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
        <div className="user" onClick={toggleDropdown} ref={userButtonRef}>
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
          <div className="options" ref={dropdownRef}>
            {currentUser ? (
              <>
                <Link
                  to={`/profile/${currentUser.id}`}
                  className="option-link"
                  onClick={() => setOpen(false)}
                >
                  <PersonIcon className="icon" />
                  <span>Профиль</span>
                </Link>
                <Link
                  to={`/profile/${currentUser.id}/reviews`}
                  className="option-link"
                  onClick={() => setOpen(false)}
                >
                  <ArticleIcon className="icon" />
                  <span>Мои отзывы</span>
                </Link>
                <Link
                  to="/settings"
                  className="option-link"
                  onClick={() => setOpen(false)}
                >
                  <SettingsIcon className="icon" />
                  <span>Настройки</span>
                </Link>
                <div
                  className="option-link logout"
                  onClick={(e) => {
                    setOpen(false);
                    handleClick(e);
                  }}
                >
                  <LogoutIcon className="icon" />
                  <span>Выйти</span>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="option-link"
                onClick={() => setOpen(false)}
              >
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

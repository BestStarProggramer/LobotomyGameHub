import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Header({ user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload();
  };

  return (
    <header style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
      <nav style={{ display: "flex", gap: "15px" }}>
        <Link to="/">Главная</Link>
        <Link to="/catalog">Каталог</Link>
        <Link to="/articles/">Статьи</Link>
        {user ? (
          <>
            <Link to="/profile">{user.username}</Link>
            <button onClick={handleLogout}>Выйти</button>
          </>
        ) : (
          <>
            <Link to="/login">Вход</Link>
            <Link to="/register">Регистрация</Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;

import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>404 — Страница не найдена</h1>
      <p>Такой страницы на сайте нет.</p>
      <Link to="/">Вернуться на главную</Link>
    </div>
  );
}

export default NotFound;

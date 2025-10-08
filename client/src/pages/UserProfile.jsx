import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("reviews");
  const [reviews, setReviews] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [articles, setArticles] = useState([]);

  const effectiveUserId =
    userId || JSON.parse(localStorage.getItem("user"))?.id;

  useEffect(() => {
    if (!effectiveUserId) return;

    fetch(`http://localhost:8800/user/${effectiveUserId}`)
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error(err));

    fetch(`http://localhost:8800/user/${effectiveUserId}/reviews`)
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch((err) => console.error(err));

    fetch(`http://localhost:8800/user/${effectiveUserId}/favorites`)
      .then((res) => res.json())
      .then((data) => setFavorites(data))
      .catch((err) => console.error(err));
  }, [effectiveUserId]);

  useEffect(() => {
    if (!effectiveUserId) return;

    if (user?.role === "editor" || user?.role === "admin") {
      fetch(`http://localhost:8800/user/${effectiveUserId}/articles`)
        .then((res) => res.json())
        .then((data) => setArticles(data))
        .catch((err) => console.error(err));
    }
  }, [user, effectiveUserId]);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="user-profile">
      <div className="user-header">
        <img src={user.avatar_url || "/default-avatar.png"} alt="avatar" />
        <h2>{user.username}</h2>
        <p>{user.bio}</p>
      </div>

      <div className="tabs">
        <button
          className={activeTab === "reviews" ? "active" : ""}
          onClick={() => setActiveTab("reviews")}
        >
          Обзоры
        </button>
        <button
          className={activeTab === "favorites" ? "active" : ""}
          onClick={() => setActiveTab("favorites")}
        >
          Избранное
        </button>
        <button
          className={activeTab === "settings" ? "active" : ""}
          onClick={() => setActiveTab("settings")}
        >
          Настройки
        </button>
        {(user.role === "editor" || user.role === "admin") && (
          <button
            className={activeTab === "articles" ? "active" : ""}
            onClick={() => setActiveTab("articles")}
          >
            Статьи
          </button>
        )}
      </div>

      <div className="tab-content">
        {activeTab === "reviews" && (
          <div>
            {reviews.length ? (
              reviews.map((r) => (
                <div key={r.id} className="review">
                  <h4>{r.game_title}</h4>
                  <p>Рейтинг: {r.rating}</p>
                  <p>{r.content}</p>
                </div>
              ))
            ) : (
              <p>Нет обзоров.</p>
            )}
          </div>
        )}

        {activeTab === "favorites" && (
          <div>
            {favorites.length ? (
              favorites.map((f) => <div key={f.id}>{f.title}</div>)
            ) : (
              <p>Нет избранного.</p>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div>
            <p>
              Здесь будут настройки пользователя (редактирование профиля, пароль
              и т.д.)
            </p>
          </div>
        )}

        {activeTab === "articles" && (
          <div>
            {(user.role === "editor" || user.role === "admin") && (
              <Link to="/article/create">
                <button style={{ marginBottom: "10px" }}>
                  Написать статью
                </button>
              </Link>
            )}

            {articles.length ? (
              articles.map((a) => (
                <div key={a.id} className="article">
                  <h4>{a.title}</h4>
                  <p>{a.content?.slice(0, 100)}...</p>
                  <Link to={`/article/edit/${a.id}`}>
                    <button>Редактировать</button>
                  </Link>
                </div>
              ))
            ) : (
              <p>Нет статей.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Articles = ({ user }) => {
  const [articles, setArticles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:8800/articles")
      .then((res) => setArticles(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Статьи и обзоры</h1>

      {user?.role === "editor" && (
        <button
          style={{ marginBottom: "20px", padding: "10px 15px" }}
          onClick={() => navigate("/article/create")}
        >
          Написать статью
        </button>
      )}

      {articles.length ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {articles.map((a) => (
            <div
              key={a.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "15px",
              }}
            >
              <h2>{a.title}</h2>
              <p>
                Автор: {a.username} {a.game_title && `| Игра: ${a.game_title}`}
              </p>
              <p>{a.content?.slice(0, 200)}...</p>
              <button onClick={() => navigate(`/article/${a.id}`)}>
                Читать полностью
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>Статей пока нет</p>
      )}
    </div>
  );
};

export default Articles;

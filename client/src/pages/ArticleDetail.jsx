import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ArticleDetail = ({ user }) => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:8800/articles/${id}`)
      .then((res) => setArticle(res.data))
      .catch((err) => {
        console.error(err);
        alert("Статья не найдена");
        navigate("/articles");
      });
  }, [id, navigate]);

  if (!article) return <p>Загрузка...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>{article.title}</h1>
      <p>
        Автор: {article.username}{" "}
        {article.game_title && `| Игра: ${article.game_title}`}
      </p>
      <p>Категория: {article.category}</p>
      <div style={{ marginTop: "20px" }}>
        <p>{article.content}</p>
      </div>

      {user?.role === "editor" && (
        <button
          style={{ marginTop: "20px", padding: "10px 15px" }}
          onClick={() => navigate(`/article/edit/${article.id}`)}
        >
          Редактировать статью
        </button>
      )}
    </div>
  );
};

export default ArticleDetail;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EditArticle = () => {
  const { articleId } = useParams();
  const navigate = useNavigate();

  const [article, setArticle] = useState({
    title: "",
    content: "",
    category: "article",
    user_id: null,
  });
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8800/articles/${articleId}`
        );
        const data = res.data;

        // Проверка прав: только автор или админ
        if (currentUser.role !== "admin" && currentUser.id !== data.user_id) {
          alert("Нет прав на редактирование этой статьи");
          navigate("/articles");
          return;
        }

        setArticle({
          title: data.title || "",
          content: data.content || "",
          category: data.category || "article",
          user_id: data.user_id,
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
        alert("Ошибка при загрузке статьи");
        navigate("/articles");
      }
    };

    fetchArticle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setArticle((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!article.title.trim() || !article.content.trim()) {
      alert("Заполните заголовок и содержание!");
      return;
    }

    try {
      await axios.put(
        `http://localhost:8800/articles/${articleId}`,
        {
          title: article.title,
          content: article.content,
          category: article.category,
        },
        {
          headers: {
            "x-user-id": currentUser.id,
            "x-user-role": currentUser.role,
          },
        }
      );
      alert("Статья обновлена!");
      navigate(`/article/${articleId}`);
    } catch (err) {
      if (err.response?.status === 403) {
        alert(err.response.data.message);
      } else {
        console.error(err);
        alert("Ошибка при сохранении статьи");
      }
    }
  };

  if (loading) return <p>Загрузка статьи...</p>;

  return (
    <div>
      <h2>Редактирование статьи</h2>
      <form onSubmit={handleSubmit}>
        <label>Заголовок:</label>
        <input
          type="text"
          name="title"
          value={article.title}
          onChange={handleChange}
        />

        <label>Содержание:</label>
        <textarea
          name="content"
          value={article.content}
          onChange={handleChange}
        />

        <label>Категория:</label>
        <select
          name="category"
          value={article.category}
          onChange={handleChange}
        >
          <option value="article">Статья</option>
          <option value="review">Обзор</option>
        </select>

        <button type="submit">Сохранить изменения</button>
      </form>
    </div>
  );
};

export default EditArticle;

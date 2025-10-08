import React, { useState } from "react";
import axios from "axios";

const CreateArticle = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("article");
  const [gameId, setGameId] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      setMessage("Сначала войдите в систему");
      return;
    }

    try {
      const res = await axios.post("http://localhost:8800/articles", {
        user_id: user.id,
        game_id: gameId || null,
        title,
        content,
        category,
      });
      setMessage("Статья успешно создана!");
      setTitle("");
      setContent("");
      setGameId("");
      setCategory("article");
    } catch (err) {
      setMessage(err.response?.data?.message || "Ошибка при создании статьи");
    }
  };

  return (
    <div>
      <h2>Создать статью</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Заголовок:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Содержание:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="6"
          />
        </div>
        <div>
          <label>Категория:</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="article">Статья</option>
            <option value="review">Обзор</option>
          </select>
        </div>
        <div>
          <label>ID игры (необязательно):</label>
          <input
            type="number"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
          />
        </div>
        <button type="submit">Создать</button>
      </form>
    </div>
  );
};

export default CreateArticle;

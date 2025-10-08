import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const CreateReview = () => {
  const { id: gameId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      alert("Сначала войдите в систему!");
      navigate("/login");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      await axios.post(`http://localhost:8800/game/${gameId}/review/create`, {
        user_id: user.id,
        rating,
        content,
      });
      alert("Отзыв успешно создан!");
      navigate(`/game/${gameId}`);
    } catch (err) {
      console.error(err);
      alert("Ошибка при создании отзыва");
    }
  };

  return (
    <div>
      <h2>Создать отзыв</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Оценка:</label>
          <input
            type="number"
            min="1"
            max="10"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Текст отзыва:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <button type="submit">Отправить</button>
      </form>
    </div>
  );
};

export default CreateReview;

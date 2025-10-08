import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EditReview = () => {
  const { reviewId } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState({ rating: 1, content: "" });

  useEffect(() => {
    axios
      .get(`/reviews/${reviewId}`)
      .then((res) =>
        setReview({ rating: res.data.rating, content: res.data.content })
      )
      .catch((err) => console.error(err));
  }, [reviewId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReview((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .put(`/reviews/${reviewId}`, review)
      .then(() => {
        alert("Обзор обновлён!");
        navigate(`/game/${review.game_id}/reviews`);
      })
      .catch((err) => console.error(err));
  };

  return (
    <div>
      <h2>Редактирование обзора</h2>
      <form onSubmit={handleSubmit}>
        <label>Оценка:</label>
        <input
          type="number"
          name="rating"
          min="1"
          max="10"
          value={review.rating}
          onChange={handleChange}
        />
        <label>Текст обзора:</label>
        <textarea
          name="content"
          value={review.content}
          onChange={handleChange}
        ></textarea>
        <button type="submit">Сохранить изменения</button>
      </form>
    </div>
  );
};

export default EditReview;

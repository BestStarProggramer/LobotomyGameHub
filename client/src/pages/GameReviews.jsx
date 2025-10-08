import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const GameReviews = () => {
  const { id: gameId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8800/game/${gameId}/reviews`
        );
        setReviews(res.data);
      } catch (err) {
        setError(err.message || "Error fetching reviews");
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [gameId]);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!reviews.length) return <p>У этой игры нет обзоров.</p>;

  return (
    <div>
      <h2>Обзоры на {gameId}</h2>
      <ul>
        {reviews.map((review) => (
          <li key={review.id}>
            <strong>{review.username}</strong> rated: {review.rating}/10
            <p>{review.content}</p>
            <small>
              Created at: {new Date(review.created_at).toLocaleString()}
            </small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GameReviews;

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const GameDetail = () => {
  const { id } = useParams();
  const [game, setGame] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:8800/catalog/${id}`)
      .then((res) => setGame(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!game) return <p>Загрузка игры...</p>;

  return (
    <div>
      <h1>{game.title}</h1>
      {game.cover_url && <img src={game.cover_url} alt={game.title} />}
      <p>{game.description}</p>
      <p>
        <strong>Жанры:</strong> {game.genres || "Не указаны"}
      </p>
      <p>
        <strong>Рейтинг:</strong> {game.rating ?? "Нет рейтинга"}
      </p>
      <p>
        <strong>Разработчик:</strong> {game.developer || "Не указан"}
      </p>
      <p>
        <strong>Издатель:</strong> {game.publisher || "Не указан"}
      </p>

      <div>
        <Link to={`/game/${id}/reviews`}>Посмотреть обзоры</Link> |{" "}
        <Link to={`/game/${id}/review/create`}>Написать обзор</Link>
      </div>
    </div>
  );
};

export default GameDetail;

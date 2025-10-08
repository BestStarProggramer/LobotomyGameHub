import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  const [popularGames, setPopularGames] = useState([]);
  const [recentGames, setRecentGames] = useState([]);
  const [recommendedGames, setRecommendedGames] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8800/catalog?sort=popular")
      .then((res) => res.json())
      .then((data) => setPopularGames(data))
      .catch((err) => console.error(err));

    fetch("http://localhost:8800/catalog?sort=recent")
      .then((res) => res.json())
      .then((data) => setRecentGames(data))
      .catch((err) => console.error(err));

    fetch("http://localhost:8800/catalog?sort=recommended")
      .then((res) => res.json())
      .then((data) => setRecommendedGames(data))
      .catch((err) => console.error(err));
  }, []);

  const renderGames = (games) =>
    games.length ? (
      <div className="games-grid">
        {games.map((game) => (
          <div key={game.id} className="game-card">
            <img
              src={game.cover_url || "/default-cover.png"}
              alt={game.title}
            />
            <h3>{game.title}</h3>
          </div>
        ))}
      </div>
    ) : (
      <p>Нет игр</p>
    );

  return (
    <div className="home-page">
      <h2>Популярные игры</h2>
      {renderGames(popularGames)}

      <h2>Недавно добавленные</h2>
      {renderGames(recentGames)}

      <h2>Рекомендованные</h2>
      {renderGames(recommendedGames)}
    </div>
  );
};

export default HomePage;

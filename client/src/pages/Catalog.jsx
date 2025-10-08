import React, { useEffect, useState } from "react";
import axios from "axios";

const Catalog = () => {
  const [games, setGames] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popular"); // выбранный фильтр

  useEffect(() => {
    axios
      .get(`http://localhost:8800/catalog?sort=${sort}`)
      .then((res) => setGames(res.data))
      .catch((err) => console.error(err));
  }, [sort]); // зависимость по sort, чтобы обновлять при смене фильтра

  const filteredGames = games.filter((game) =>
    game.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1>Каталог игр</h1>

      <div style={{ marginBottom: "10px" }}>
        <label>Фильтр: </label>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="popular">Популярные</option>
          <option value="recent">Недавние</option>
          <option value="recommended">Рекомендованные</option>
          <option value="title">По названию</option>
        </select>
      </div>

      <input
        type="text"
        placeholder="Поиск по названию..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: "20px", padding: "5px", width: "300px" }}
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {filteredGames.length > 0 ? (
          filteredGames.map((game) => (
            <div
              key={game.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "10px",
                width: "200px",
              }}
            >
              <img
                src={game.cover_url || "https://via.placeholder.com/200x250"}
                alt={game.title}
                style={{ width: "100%", height: "250px", objectFit: "cover" }}
              />
              <h3>{game.title}</h3>
              <p>{game.description?.slice(0, 60)}...</p>
              <button
                onClick={() => (window.location.href = `/game/${game.id}`)}
              >
                Подробнее
              </button>
            </div>
          ))
        ) : (
          <p>Игры не найдены</p>
        )}
      </div>
    </div>
  );
};

export default Catalog;

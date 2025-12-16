import React, { useState, useEffect } from "react";
import { fetchGamesList } from "../../utils/rawg.js";
import GamesGrid from "../../components/gamesgrid/GamesGrid";
import "./games.scss";

const Games = () => {
  const [games, setGames] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Загрузка игр
  const loadGames = async (pageNumber = 1, reset = false) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const filters = searchTerm ? { search: searchTerm } : {};
      const data = await fetchGamesList(pageNumber, 30, filters);
      
      setGames(prev => reset ? data.games : [...prev, ...data.games]);
      setHasMore(!!data.next);
      setPage(pageNumber);
    } catch (error) {
      console.error("Ошибка загрузки игр:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Первая загрузка
  useEffect(() => {
    loadGames(1, true);
  }, []);

  // Поиск
  const handleSearch = () => {
    loadGames(1, true);
  };

  // Загрузить ещё
  const handleLoadMore = () => {
    loadGames(page + 1, false);
  };

  return (
    <div className="games-page">
      <div className="container">
        <h1 className="games-page__title">Каталог игр</h1>

        {/* Поиск */}
        <div className="games-page__search">
          <input
            type="text"
            placeholder="Поиск игр..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <button onClick={handleSearch}>Найти</button>
        </div>

        {/* Сетка игр */}
        <GamesGrid games={games} />

        {/* Кнопка "Загрузить ещё" */}
        {hasMore && (
          <div className="games-page__load-more">
            <button onClick={handleLoadMore} disabled={isLoading}>
              {isLoading ? "Загрузка..." : "Загрузить ещё"}
            </button>
          </div>
        )}

        {!hasMore && games.length > 0 && (
          <p className="games-page__end">Все игры загружены</p>
        )}
      </div>
    </div>
  );
};

export default Games;

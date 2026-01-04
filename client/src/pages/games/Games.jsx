import React, { useState, useEffect } from "react";
import { fetchGamesList } from "../../utils/rawg.js";
import { fetchLocalGamesList } from "../../utils/localGames.js";
import GamesGrid from "../../components/gamesgrid/GamesGrid";
import "./games.scss";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SearchIcon from "@mui/icons-material/Search";

const Games = () => {
  const [games, setGames] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showLocalOnly, setShowLocalOnly] = useState(false);

  const loadGames = async (pageNumber = 1, reset = false) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const filters = searchTerm ? { search: searchTerm } : {};

      const data = showLocalOnly
        ? await fetchLocalGamesList(pageNumber, 30, filters)
        : await fetchGamesList(pageNumber, 30, filters);

      const items = data.results ?? data.games ?? data;

      setGames((prev) => (reset ? items : [...prev, ...items]));
      setHasMore(items.length === 30);
      setPage(pageNumber);
    } catch (error) {
      console.error("Ошибка загрузки игр:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGames(1, true);
  }, [showLocalOnly]);

  const handleSearch = () => {
    loadGames(1, true);
  };

  const handleLoadMore = () => {
    loadGames(page + 1, false);
  };

  return (
    <div className="games-page">
      <div className="container">
        <h1 className="games-page__title">Каталог игр</h1>

        <div className="games-page__filters">
          <div className="games-page__search">
            <FilterAltIcon className="search-filter-icon" />
            <input
              type="text"
              placeholder="Поиск игр..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button onClick={handleSearch} className="search-button">
              <SearchIcon />
            </button>
          </div>

          <div className="games-page__checkbox">
            <label>
              <input
                type="checkbox"
                checked={showLocalOnly}
                onChange={(e) => setShowLocalOnly(e.target.checked)}
              />
              <span> Только добавленные на сайт </span>
            </label>
          </div>
        </div>

        <GamesGrid games={games} />

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

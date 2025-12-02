import React, { useState, useEffect, useCallback, useRef } from "react";
import FilterListIcon from "@mui/icons-material/FilterList";
import GameBlock from "../../components/gameblock/GameBlock";
import "./games.scss";
import { fetchGamesList, chunkArray } from "../../utils/rawg.js";

const GAMES_PER_BLOCK = 5;

const Games = () => {
  const [gameBlocks, setGameBlocks] = useState([]); // [{id, games: [...]}, ...]
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);

  const sentinelRef = useRef(null);

  const fetchGames = useCallback(
    async (pageNumber = 1, reset = false) => {
      if (!reset && !hasMore) return;

      setIsLoading(true);
      try {
        const data = await fetchGamesList(pageNumber, 100, searchTerm);

        const newGamesFlat = data.results.flat();

        setGameBlocks((prevBlocks) => {
          const existingSlugs = new Set(
            prevBlocks.flatMap((block) => block.games.map((g) => g.slug))
          );

          const filteredGames = newGamesFlat.filter(
            (game) => !existingSlugs.has(game.slug)
          );

          const newBlocks = chunkArray(filteredGames, 5).map((gamesArray) => ({
            id: Date.now() + Math.random(),
            games: gamesArray,
          }));

          if (reset) {
            return newBlocks;
          } else {
            return [...prevBlocks, ...newBlocks];
          }
        });

        setPage(pageNumber + 1);
        setHasMore(Boolean(data.next));
      } catch (error) {
        console.error("Ошибка при загрузке игр:", error);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    },
    [hasMore, searchTerm]
  );

  useEffect(() => {
    setGameBlocks([]);
    setPage(1);
    setHasMore(true);
    fetchGames(1, true);
  }, [searchTerm]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchGames(page);
    }
  }, [isLoading, hasMore, fetchGames, page]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { root: null, rootMargin: "200px", threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, isLoading, hasMore]);

  return (
    <div className="gamesPage home">
      <div className="container">
        <h1 className="gamesPage__title">Каталог игр</h1>

        <div className="gamesPage__controls">
          <div className="searchBox">
            <input
              type="text"
              placeholder="Поиск по названию..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="searchBox__clear"
              >
                ×
              </button>
            )}
          </div>

          <button
            className="filterButton"
            onClick={() => setIsFilterOpen(true)}
            aria-label="Фильтры"
          >
            <FilterListIcon />
          </button>
        </div>

        {isFilterOpen && (
          <div className="filterModal">
            <div className="filterModal__content">
              <h2>Фильтры</h2>
              <p>Настройка фильтров...</p>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="filterModal__close"
              >
                Применить и закрыть
              </button>
            </div>
          </div>
        )}

        <div className="games-blocks-container">
          {gameBlocks.map((block) => (
            <GameBlock key={block.id} games={block.games} />
          ))}
        </div>

        {isLoading && gameBlocks.length === 0 && (
          <p className="loadingIndicator">Загрузка игр...</p>
        )}
        {isLoading && gameBlocks.length > 0 && (
          <p className="loadingIndicator">Загрузка следующих игр...</p>
        )}

        {hasMore && (
          <div
            ref={sentinelRef}
            style={{
              height: "20px",
              margin: "10px 0",
            }}
          />
        )}

        {!hasMore && gameBlocks.length > 0 && (
          <p className="endMessage">Все игры загружены!</p>
        )}

        {gameBlocks.length === 0 && !isLoading && (
          <p className="endMessage">Игр по вашему запросу не найдено.</p>
        )}
      </div>
    </div>
  );
};

export default Games;

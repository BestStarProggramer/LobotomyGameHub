import React, { useState, useEffect, useCallback } from "react";
import FilterListIcon from "@mui/icons-material/FilterList";
import GameBlock from "../../components/gameblock/GameBlock";
import "./games.scss";
import axios from "axios";
import { fetchGamesList, fetchGameDetailsBySlug } from "../../utils/rawg.js";

// const MOCK_GAMES = Array.from({ length: 100 }, (_, i) => ({
//   id: i + 1,
//   title: `Игра #${i + 1}: Cyber-Adventure - The Fallen City`,
//   imageUrl: "/img/game_poster.jpg",
// }));

// const mockFetchGames = (offset, searchTerm, filters) => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       let filteredGames = MOCK_GAMES;

//       if (searchTerm) {
//         const lowerSearchTerm = searchTerm.toLowerCase();
//         filteredGames = filteredGames.filter((game) =>
//           game.title.toLowerCase().includes(lowerSearchTerm)
//         );
//       }

//       const gamesSlice = filteredGames.slice(offset, offset + GAMES_PER_BLOCK);

//       resolve({
//         games: gamesSlice,
//         totalCount: filteredGames.length,
//         hasMore: offset + gamesSlice.length < filteredGames.length,
//       });
//     }, 800);
//   });
// };

const GAMES_PER_BLOCK = 5;
const API_KEY = process.env.API_KEY;

const Games = () => {
  const [gameBlocks, setGameBlocks] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchGames = useCallback(
    async (currentOffset, reset = false) => {
      if (!hasMore && !reset) return;

      setIsLoading(true);
      try {
        const { games: newGames, hasMore: newHasMore } = await mockFetchGames(
          currentOffset,
          searchTerm,
          {}
        );

        if (newGames.length > 0) {
          const newBlock = {
            id: Date.now() + Math.random(), // уникальный ID
            games: newGames,
          };

          setGameBlocks((prevBlocks) =>
            reset ? [newBlock] : [...prevBlocks, newBlock]
          );
          setOffset(currentOffset + newGames.length);
        }

        setHasMore(newHasMore);
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
    setOffset(0);
    setHasMore(true);
    fetchGames(0, true);
  }, [searchTerm]);

  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchGames(offset);
    }
  };

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
            ref={(element) => {
              if (!element || isLoading) return;
              const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                  loadMore();
                }
              });
              observer.observe(element);
              return () => observer.unobserve(element);
            }}
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

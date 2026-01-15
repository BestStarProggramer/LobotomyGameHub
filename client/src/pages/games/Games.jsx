import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchGamesList } from "../../utils/rawg.js";
import { fetchLocalGamesList } from "../../utils/localGames.js";
import GamesGrid from "../../components/gamesgrid/GamesGrid";
import "./games.scss";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import Checkbox from "@mui/material/Checkbox";

const AVAILABLE_GENRES = [
  "Action",
  "Indie",
  "Adventure",
  "RPG",
  "Strategy",
  "Shooter",
  "Casual",
  "Simulation",
  "Puzzle",
  "Arcade",
  "Platformer",
  "Massively Multiplayer",
  "Racing",
  "Sports",
  "Fighting",
  "Family",
  "Board Games",
  "Card",
  "Educational",
];

const Games = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [games, setGames] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    localOnly: searchParams.get("localOnly") === "true",
    selectedGenres: searchParams.get("genres")
      ? searchParams.get("genres").split(",")
      : [],
    dateFrom: "",
    dateTo: "",
    orderBy: searchParams.get("orderBy") || "released",
    orderDirection: searchParams.get("orderDirection") || "desc",
    minRating: "",
  });

  const loadGames = async (pageNumber = 1, reset = false) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      let queryParams = {};

      if (filters.localOnly) {
        if (searchTerm.trim() !== "") {
          queryParams.search = searchTerm;
        }

        if (filters.orderBy === "popularity") {
          queryParams.ordering = "popularity";
        } else if (
          filters.orderBy !== "released" ||
          filters.orderDirection !== "desc"
        ) {
          let orderingParam = filters.orderBy;
          if (filters.orderDirection === "desc") {
            orderingParam = `-${filters.orderBy}`;
          }
          queryParams.ordering = orderingParam;
        }

        if (filters.selectedGenres.length > 0) {
          let genresParam = filters.selectedGenres
            .map((g) => g.toLowerCase().replace(/\s+/g, "-"))
            .join(",");
          queryParams.genres = genresParam;
        }

        if (filters.dateFrom && filters.dateTo) {
          let datesParam = `${filters.dateFrom},${filters.dateTo}`;
          queryParams.dates = datesParam;
        }

        if (filters.minRating) {
          queryParams.min_rating = filters.minRating;
        }
      } else {
        const hasActiveFilters =
          searchTerm.trim() !== "" ||
          filters.selectedGenres.length > 0 ||
          filters.dateFrom ||
          filters.dateTo ||
          filters.orderBy !== "released" ||
          filters.orderDirection !== "desc";

        if (hasActiveFilters) {
          let orderingParam = filters.orderBy;
          if (filters.orderBy === "popularity") orderingParam = "-added";

          if (
            filters.orderDirection === "desc" &&
            filters.orderBy !== "popularity"
          ) {
            orderingParam = `-${filters.orderBy}`;
          }

          let datesParam = null;
          if (filters.dateFrom && filters.dateTo) {
            datesParam = `${filters.dateFrom},${filters.dateTo}`;
          }

          let genresParam = null;
          if (filters.selectedGenres.length > 0) {
            genresParam = filters.selectedGenres
              .map((g) => g.toLowerCase().replace(/\s+/g, "-"))
              .join(",");
          }

          if (searchTerm.trim() !== "") {
            queryParams.search = searchTerm;
          }

          if (
            filters.orderBy !== "released" ||
            filters.orderDirection !== "desc"
          ) {
            queryParams.ordering = orderingParam;
          }

          if (genresParam) {
            queryParams.genres = genresParam;
          }

          if (datesParam) {
            queryParams.dates = datesParam;
          }
        }
      }

      const fetcher = filters.localOnly ? fetchLocalGamesList : fetchGamesList;
      const data = await fetcher(pageNumber, 30, queryParams);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleSearch = () => {
    loadGames(1, true);
  };

  const handleLoadMore = () => {
    loadGames(page + 1, false);
  };

  const toggleGenre = (genre) => {
    setFilters((prev) => {
      const exists = prev.selectedGenres.includes(genre);
      const newGenres = exists
        ? prev.selectedGenres.filter((g) => g !== genre)
        : [...prev.selectedGenres, genre];
      return { ...prev, selectedGenres: newGenres };
    });
  };

  const resetFilters = () => {
    setFilters({
      localOnly: false,
      selectedGenres: [],
      dateFrom: "",
      dateTo: "",
      orderBy: "released",
      orderDirection: "desc",
      minRating: "",
    });
    setSearchTerm("");
  };

  return (
    <div className="games-page">
      <div className="container">
        <h1 className="games-page__title">Каталог игр</h1>

        <div className="games-page__search-bar-container">
          <div className="games-page__search">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`filter-toggle-btn ${showFilters ? "active" : ""}`}
              title="Открыть фильтры"
            >
              <FilterAltIcon />
            </button>

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
        </div>

        {showFilters && (
          <div className="games-page__filters-panel">
            <div className="filters-header">
              <h3>Фильтры</h3>
              <button className="reset-btn" onClick={resetFilters}>
                <RestartAltIcon style={{ fontSize: 16 }} /> Сбросить
              </button>
            </div>

            <div className="filters-grid">
              <div className="filter-column">
                <label className="checkbox-label local-only">
                  <Checkbox
                    checked={filters.localOnly}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        localOnly: e.target.checked,

                        orderBy: e.target.checked
                          ? prev.orderBy
                          : prev.orderBy === "popularity"
                          ? "released"
                          : prev.orderBy,
                      }))
                    }
                    sx={{
                      color: "#53257d",
                      "&.Mui-checked": { color: "#6b2da8" },
                    }}
                  />
                  <span>Только добавленные на сайт</span>
                </label>

                <div className="control-group">
                  <label>Сортировка по</label>
                  <select
                    value={filters.orderBy}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        orderBy: e.target.value,
                      }))
                    }
                  >
                    <option value="name">Названию</option>
                    <option value="released">Дате выхода</option>
                    <option value="created">Дате добавления</option>
                    <option value="rating">Рейтингу</option>

                    {filters.localOnly && (
                      <option value="popularity">Популярности</option>
                    )}
                  </select>
                </div>

                {filters.orderBy !== "popularity" && (
                  <div className="control-group">
                    <label>Порядок</label>
                    <select
                      value={filters.orderDirection}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          orderDirection: e.target.value,
                        }))
                      }
                    >
                      <option value="desc">По убыванию</option>
                      <option value="asc">По возрастанию</option>
                    </select>
                  </div>
                )}

                {filters.localOnly && (
                  <div className="control-group">
                    <label>Мин. рейтинг (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      step="0.5"
                      value={filters.minRating}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          minRating: e.target.value,
                        }))
                      }
                      placeholder="Например: 4.5"
                    />
                  </div>
                )}
              </div>

              <div className="filter-column">
                <h4>Дата релиза</h4>
                <div className="date-inputs">
                  <div className="date-field">
                    <span>От:</span>
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          dateFrom: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="date-field">
                    <span>До:</span>
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          dateTo: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="filter-column genres-column">
                <h4>Жанры</h4>
                <div className="genres-list">
                  {AVAILABLE_GENRES.map((genre) => (
                    <label key={genre} className="genre-checkbox">
                      <input
                        type="checkbox"
                        checked={filters.selectedGenres.includes(genre)}
                        onChange={() => toggleGenre(genre)}
                      />
                      <span>{genre}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

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
        {!isLoading && games.length === 0 && (
          <p className="games-page__end">Игры не найдены</p>
        )}
      </div>
    </div>
  );
};

export default Games;

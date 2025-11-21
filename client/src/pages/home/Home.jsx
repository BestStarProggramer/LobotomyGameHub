import "./home.scss";
import { Link } from "react-router-dom";
import MainGameCard from "../../components/maingamecard/MainGameCard";

const Home = () => {
  // Заглушки данных для трендовой игры
  const trendingGame = {
    id: 1,
    title: "Silent Hill f",
    description:
      "Родной город Хинако окутан туманом, что заставляет ее сражаться с гротескными монстрами и решать жуткие головоломки. Раскройте волнующую красоту, скрытую в ужасе.",
    genres: ["Суравйвал хоррор", "Психологический хоррор"],
    rating: 4.3,
    imageUrl: "/img/game_poster.jpg",
  };

  // Заглушки для новинок
  const newGames = [
    {
      id: 2,
      title: "Dying Light: The Beast",
      imageUrl: "/img/game_poster.jpg",
    },
    {
      id: 3,
      title: "Borderlands 4",
      imageUrl: "/img/game_poster.jpg",
    },
    {
      id: 4,
      title: "No, I'm not a Human",
      imageUrl: "/img/game_poster.jpg",
    },
    {
      id: 5,
      title: "Hollow Knight: Silksong",
      imageUrl: "/img/game_poster.jpg",
    },
    { id: 6, title: "Ght", imageUrl: "/img/game_poster.jpg" },
  ];

  // Заглушки для рекомендуемых
  const recommendedGames = [
    {
      id: 7,
      title: "Mесла chaos",
      imageUrl: "/img/game_poster.jpg",
    },
    {
      id: 8,
      title: "WARSCREWDRIVER 42K",
      imageUrl: "/img/game_poster.jpg",
    },
    {
      id: 9,
      title: "pakingo@RE",
      imageUrl: "/img/game_poster.jpg",
    },
    {
      id: 10,
      title: "Длинное название чтобы показать перенос",
      imageUrl: "/img/game_poster.jpg",
    },
    {
      id: 11,
      title: "Cyberpunk 2077",
      imageUrl: "/img/game_poster.jpg",
    },
  ];

  // Заглушки для недавно добавленных
  const recentlyAddedGames = [
    {
      id: 12,
      title: "Elden Ring: Shadow",
      imageUrl: "/img/game_poster.jpg",
    },
    {
      id: 13,
      title: "Stellar Blade",
      imageUrl: "/img/game_poster.jpg",
    },
    {
      id: 14,
      title: "Final Fantasy VII Rebirth",
      imageUrl: "/img/game_poster.jpg",
    },
    {
      id: 15,
      title: "Like a Dragon: Infinite Wealth",
      imageUrl: "/img/game_poster.jpg",
    },
    {
      id: 16,
      title: "Persona 3 Reload",
      imageUrl: "/img/game_poster.jpg",
    },
  ];

  return (
    <div className="home">
      <div className="container">
        {/* Блок "Сейчас в тренде" */}
        <section className="trending-section">
          <h2>Сейчас в тренде</h2>
          <MainGameCard game={trendingGame} />
        </section>

        {/* Блок "Недавно добавленные" */}
        <section className="recently-added-section">
          <h2>Недавно добавленные</h2>
          <div className="games-grid">
            {recentlyAddedGames.map((game) => (
              <Link
                key={game.id}
                to={`/games/${game.id}`}
                className="game-card"
              >
                <div className="game-poster-small">
                  <img
                    src={game.imageUrl}
                    alt={game.title}
                  />
                </div>
                <h3>{game.title}</h3>
              </Link>
            ))}
          </div>
        </section>

        {/* Блок "Новинки" */}
        <section className="new-releases-section">
          <h2>Новинки</h2>
          <div className="games-grid">
            {newGames.map((game) => (
              <Link
                key={game.id}
                to={`/games/${game.id}`}
                className="game-card"
              >
                <div className="game-poster-small">
                  <img
                    src={game.imageUrl}
                    alt={game.title}
                  />
                </div>
                <h3>{game.title}</h3>
              </Link>
            ))}
          </div>
        </section>

        {/* Блок "Рекомендуем" */}
        <section className="recommended-section">
          <h2>Рекомендуем</h2>
          <div className="games-grid">
            {recommendedGames.map((game) => (
              <Link
                key={game.id}
                to={`/games/${game.id}`}
                className="game-card"
              >
                <div className="game-poster-small">
                  <img
                    src={game.imageUrl}
                    alt={game.title}
                  />
                </div>
                <h3>{game.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;

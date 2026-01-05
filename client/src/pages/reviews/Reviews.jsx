import "./reviews.scss";
import ReviewsBlock from "../../components/reviewsblock/ReviewsBlock";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchGameDetailsBySlug } from "../../utils/rawg";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const Reviews = () => {
  const params = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const resolveSlugFromPath = () => {
    if (params.slug) return params.slug;
    try {
      const parts = window.location.pathname.split("/").filter(Boolean);
      const gamesIndex = parts.findIndex((p) => p.toLowerCase() === "games");
      if (gamesIndex >= 0 && parts.length > gamesIndex + 1) {
        return parts[gamesIndex + 1];
      }
    } catch (e) {}
    return null;
  };

  useEffect(() => {
    let mounted = true;
    const slug = resolveSlugFromPath();

    const loadGame = async () => {
      if (!slug) {
        if (mounted) {
          setError("Не указан slug игры в URL.");
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const g = await fetchGameDetailsBySlug(slug);
        if (mounted) {
          if (!g) {
            setError("Игра не найдена по указанному slug.");
            setGame(null);
          } else {
            setGame(g);
          }
        }
      } catch (e) {
        console.error("Ошибка загрузки игры:", e);
        if (mounted) setError("Не удалось загрузить данные игры");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadGame();
    return () => (mounted = false);
  }, [params]);

  if (loading)
    return (
      <div className="reviews-page">
        <div className="container">
          <div className="loading-spinner">Загрузка…</div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="reviews-page">
        <div className="container">
          <div className="error-message" style={{ color: "white" }}>
            {error}
          </div>
        </div>
      </div>
    );

  if (!game)
    return (
      <div className="reviews-page">
        <div className="container">
          <div className="not-found">Игра не найдена</div>
        </div>
      </div>
    );

  return (
    <div className="reviews-page">
      <div className="banner">
        <img
          src={game.backgroundimage || "/img/game_banner.jpg"}
          alt={game.title}
        />
      </div>

      <div className="container">
        <div className="page-header">
          <Link to={`/games/${game.slug}`} className="back-to-game">
            <ArrowBackIcon className="back-icon" />
            <span>На страницу игры</span>
          </Link>

          <div className="header-content">
            <h1 className="page-title">Страница отзывов</h1>
            <h2 className="game-title">{game.title}</h2>
          </div>
        </div>

        <ReviewsBlock
          gameId={game.id}
          gameSlug={game.slug}
          showReviewInput={true}
          initialLimit={5}
          infinite={true}
        />
      </div>
    </div>
  );
};

export default Reviews;

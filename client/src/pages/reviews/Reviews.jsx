import "./reviews.scss";
import ReviewsBlock from "../../components/reviewsblock/ReviewsBlock";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchGameDetailsBySlug } from "../../utils/rawg";

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
          setError(
            "Не указан slug игры в URL. Убедитесь, что маршрут содержит :slug (например /games/:slug/reviews)."
          );
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

  if (loading) return <div className="container">Загрузка…</div>;
  if (error)
    return (
      <div className="container" style={{ color: "white" }}>
        {error}
      </div>
    );
  if (!game) return <div className="container">Игра не найдена</div>;

  return (
    <div className="reviews-page">
      <div className="container">
        <h1 style={{ color: "white", marginBottom: 16 }}>Страница отзывов</h1>

        <img
          src={game.backgroundimage || "/img/game_banner.jpg"}
          alt={game.title}
          style={{ width: "100%", borderRadius: 12, marginBottom: 12 }}
        />

        <h2 style={{ color: "white", marginBottom: 24 }}>{game.title}</h2>

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

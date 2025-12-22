import "./game.scss";
import { Link, useParams } from "react-router-dom";
import StarIcon from "@mui/icons-material/Star";
import ReviewsBlock from "../../components/reviewsblock/ReviewsBlock";
import { AuthContext } from "../../context/authContext";
import { useContext, useEffect, useState } from "react";
import {
  fetchGameDetailsBySlug,
  fetchGameScreenshotsBySlug,
  fetchGameTrailersBySlug,
} from "../../utils/rawg";

const Game = () => {
  const { currentUser } = useContext(AuthContext);
  const { GameId } = useParams(); // slug from url
  const [game, setGame] = useState(null);
  const [bannerUrl, setBannerUrl] = useState("/img/gamebanner.jpg");
  const [screenshots, setScreenshots] = useState([]);
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeScreenshotIndex, setActiveScreenshotIndex] = useState(0);

  //  6 скринов для листания
  const visibleScreenshots = screenshots.slice(0, 6);

  const openLightbox = (index) => {
    setActiveScreenshotIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const goPrev = () => {
    if (visibleScreenshots.length === 0) return;
    setActiveScreenshotIndex(
      (prev) => (prev - 1 + visibleScreenshots.length) % visibleScreenshots.length
    );
  };

  const goNext = () => {
    if (visibleScreenshots.length === 0) return;
    setActiveScreenshotIndex((prev) => (prev + 1) % visibleScreenshots.length);
  };

  // клавиши Esc,ArrowLeft,ArrowRight
  useEffect(() => {
    if (!isLightboxOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isLightboxOpen, visibleScreenshots.length]);

  // нормализация трейлера (на случай если fetchGameTrailersBySlug вернёт объект/массив)
  const normalizeTrailerUrl = (trailer) => {
    if (!trailer) return null;

    if (typeof trailer === "string") {
      const v = trailer.trim();
      return v.length > 0 ? v : null;
    }

    if (Array.isArray(trailer)) {
      return normalizeTrailerUrl(trailer[0]);
    }

    if (typeof trailer === "object") {
      const v =
        trailer.url ||
        trailer.video ||
        trailer.trailerUrl ||
        trailer.data?.url ||
        trailer.data?.max ||
        trailer.data?.["720"] ||
        trailer.data?.["480"] ||
        (Array.isArray(trailer.results) ? trailer.results[0]?.data?.max : null) ||
        (Array.isArray(trailer.results) ? trailer.results[0]?.data?.["480"] : null) ||
        (Array.isArray(trailer.results) ? trailer.results[0]?.url : null);

      return typeof v === "string" && v.trim().length > 0 ? v.trim() : null;
    }

    return null;
  };

  const hasTrailer = Boolean(trailerUrl);

  const reviewsList = [
    {
      id: 1,
      username: "5Hnet5K",
      avatar: "/img/profilePic.jpg",
      rating: "4",
      date: "03.11.2025",
      content:
        "Прошло не так много времени с релиза долгожданного сиквела Hollow Knight, но игроки уже отыскали довольно внушительное количество разнообразных секретов, причем на самой первой локации. Проведя небольшое исследование всех доступных материалов по этой теме, я составил полный список абсолютно всех...",
    },
    {
      id: 2,
      username: "ShadowHunter",
      avatar: "/img/default-avatar.jpg",
      rating: "5",
      date: "05.11.2025",
      content:
        "Игра просто невероятна! Сюжет захватывает с первых минут, а графика на высшем уровне. Всем советую, это настоящий шедевр в жанре. С нетерпением жду дополнений и обновлений.",
    },
    {
      id: 3,
      username: "QuickLearner",
      avatar: "/img/profilePic.jpg",
      rating: "3",
      date: "08.11.2025",
      content:
        "Хорошая, но не идеальная. Есть некоторые проблемы с балансом и оптимизацией, но в целом оставляет приятное впечатление. Игра определенно заслуживает внимания, но требует небольшой доработки.",
    },
  ];

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const details = await fetchGameDetailsBySlug(GameId);
        const shots = await fetchGameScreenshotsBySlug(GameId);
        const trailerRaw = await fetchGameTrailersBySlug(GameId);

        if (cancelled) return;

        const safeShots = Array.isArray(shots) ? shots : [];
        const trailerNormalized = normalizeTrailerUrl(trailerRaw);

        setGame(details);
        setScreenshots(safeShots);
        setTrailerUrl(trailerNormalized);

        // если трейлер появился — закрыть лайтбокс (чтобы не висел поверх)
        if (trailerNormalized) {
          setIsLightboxOpen(false);
        }

        const nextBanner =
          (Array.isArray(safeShots) && safeShots[0]) ||
          details?.backgroundimage ||
          "/img/gamebanner.jpg";

        setBannerUrl(nextBanner);
      } catch (e) {
        if (!cancelled) setError("Не удалось загрузить игру");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (GameId) load();

    return () => {
      cancelled = true;
    };
  }, [GameId]);

  if (loading) {
    return (
      <div className="game">
        <div className="gamewrapper" style={{ color: "white" }}>
          Загрузка...
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="game">
        <div className="gamewrapper" style={{ color: "white" }}>
          {error}
        </div>
      </div>
    );
  }

  const posterUrl = game?.backgroundimage || "/img/gameposter.jpg";
  const title = game?.title || "";
  const description = game?.description || "";
  const rating = Number(game?.rating || 0).toFixed(1);

  return (
    <div className="game">
      <div className="game_wrapper">
        <div className="banner">
          <img src={bannerUrl} alt={title} />
        </div>

        <div className="info">
          <div className="top">
            <div className="left">
              <div className="poster_wrapper">
                <img src={posterUrl} alt={title} />
              </div>

              <div className="rating">
                <span>{rating}</span>
                <StarIcon className="star" />
              </div>
            </div>

            <div className="right">
              <h1>{title}</h1>
              <div className="description">
                <p> {description || "Описание отсутствует."}</p>
              </div>
            </div>
          </div>

          <div className="bottom">
            <h2>Трейлер игры</h2>
            <div className="sections">
              <div className="left">
                {hasTrailer ? (
                  <video src={trailerUrl} controls />
                ) : (
                  <>
                    <p className="no-trailer">Трейлер отсутствует.</p>

                    {visibleScreenshots.length > 0 ? (
                      <div className="screenshots">
                        <button
                          type="button"
                          className="screenshot_btn screenshot_btn--preview"
                          onClick={() => openLightbox(0)}
                        >
                          <img
                            src={visibleScreenshots[0]}
                            alt="screenshot-preview"
                          />
                        </button>
                      </div>
                    ) : (
                      <p className="no-trailer">Скриншоты отсутствуют.</p>
                    )}
                  </>
                )}
              </div>

              <div className="right">
                <div className="articles_wrapper">
                  <div className="article">
                    <div className="top">
                      <h1>{title || "Статья"}</h1>
                      <div className="author">
                        <span>5Hnet5K</span>
                        <img src="/img/profilePic.jpg" alt="аватар" />
                      </div>
                    </div>

                    <div className="bottom">
                      <p>
                        Прошло не так много времени с релиза долгожданного
                        сиквела Hollow Knight, но игроки уже отыскали довольно
                        внушительное количество разнообразных секретов, причем
                        на самой первой локации. Проведя небольшое исследование
                        всех доступных материалов по этой теме, я составил
                        полный список абсолютно всех...
                      </p>
                      <Link to="/article/1" className="read_more">
                        <p>Открыть статью</p>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* лайтбокс только когда трейлера нет */}
            {!hasTrailer && isLightboxOpen && visibleScreenshots.length > 0 && (
              <div className="lightbox_overlay" onClick={closeLightbox}>
                <div
                  className="lightbox_content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="lightbox_close"
                    onClick={closeLightbox}
                  >
                    ✕
                  </button>

                  <button
                    type="button"
                    className="lightbox_nav lightbox_nav__prev"
                    onClick={goPrev}
                  >
                    ‹
                  </button>

                  <img
                    className="lightbox_image"
                    src={visibleScreenshots[activeScreenshotIndex]}
                    alt={`screenshot-full-${activeScreenshotIndex}`}
                  />

                  <button
                    type="button"
                    className="lightbox_nav lightbox_nav__next"
                    onClick={goNext}
                  >
                    ›
                  </button>

                  <div className="lightbox_counter">
                    {activeScreenshotIndex + 1} / {visibleScreenshots.length}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="reviews-container">
        <ReviewsBlock
          reviews={reviewsList}
          buttonText="На страницу с отзывами →"
          buttonLink={`/games/${GameId}/reviews`}
          showReviewInput={currentUser}
        />
      </div>
    </div>
  );
};

export default Game;

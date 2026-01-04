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
  const { GameId } = useParams();

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [mediaList, setMediaList] = useState([]);
  const [activeMedia, setActiveMedia] = useState(null);

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const details = await fetchGameDetailsBySlug(GameId);
        const shots = await fetchGameScreenshotsBySlug(GameId);
        const trailer = await fetchGameTrailersBySlug(GameId);

        if (cancelled) return;

        setGame(details);

        const combinedMedia = [];
        if (trailer) combinedMedia.push({ type: "video", url: trailer });
        if (shots)
          shots.forEach((s) => combinedMedia.push({ type: "image", url: s }));

        setMediaList(combinedMedia);
        setActiveMedia(
          combinedMedia[0] || { type: "image", url: details.backgroundimage }
        );
      } catch (e) {
        if (!cancelled) setError("Не удалось загрузить игру");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [GameId]);

  if (loading)
    return (
      <div className="game">
        <div className="gamewrapper">Загрузка...</div>
      </div>
    );
  if (error)
    return (
      <div className="game">
        <div className="gamewrapper">{error}</div>
      </div>
    );

  const ratingValue = Number(game?.rating || 0);
  const ratingDisplay = ratingValue > 0 ? ratingValue.toFixed(1) : "N/A";

  const rawDescription = game?.description?.replace(/<[^>]*>?/gm, "") || "";
  const shouldTruncate = rawDescription.length > 150;
  const displayDescription = isExpanded
    ? game?.description
    : rawDescription.slice(0, 150) + "...";

  return (
    <div className="game">
      <div className="game_wrapper">
        <div className="banner">
          <img
            src={game?.backgroundimage || "/img/gamebanner.jpg"}
            alt="banner"
          />
        </div>

        <div className="game_content">
          <div className="main_info_section">
            <div className="media_container">
              <div className="main_display">
                {activeMedia?.type === "video" ? (
                  <video
                    src={activeMedia.url}
                    controls
                    autoPlay
                    muted
                    key={activeMedia.url}
                  />
                ) : (
                  <img src={activeMedia?.url} alt="active-media" />
                )}
              </div>
              <div className="thumbnails_list">
                {mediaList.map((item, idx) => (
                  <div
                    key={idx}
                    className={`thumb_item ${
                      activeMedia?.url === item.url ? "active" : ""
                    }`}
                    onClick={() => setActiveMedia(item)}
                  >
                    {item.type === "video" ? (
                      <div className="video_placeholder">▶</div>
                    ) : (
                      <img src={item.url} alt="thumb" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="text_info">
              <div className="title_row">
                <h1>{game?.title}</h1>
                <div className="rating_badge">
                  <span>{ratingDisplay}</span>
                  <StarIcon className="star_icon" />
                </div>
              </div>

              <div className="description_box">
                <div
                  className="content"
                  dangerouslySetInnerHTML={{ __html: displayDescription }}
                />
                {shouldTruncate && (
                  <span
                    className="toggle_btn"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? " Свернуть" : " Развернуть"}
                  </span>
                )}
              </div>

              <div className="game_meta">
                <p>
                  <strong>Релиз:</strong>{" "}
                  {game?.released
                    ? new Date(game.released).toLocaleDateString("ru-RU")
                    : "Неизвестно"}
                </p>
                <p>
                  <strong>Жанры:</strong> {game?.genres?.join(", ")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="reviews-container">
        <ReviewsBlock
          reviews={[]}
          buttonText="Все отзывы →"
          buttonLink={`/games/${GameId}/reviews`}
          showReviewInput={currentUser}
          gameId={game?.id || GameId}
        />
      </div>
    </div>
  );
};

export default Game;

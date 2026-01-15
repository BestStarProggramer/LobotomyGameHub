import "./horizontalScroller.scss";
import { Link } from "react-router-dom";
import StarIcon from "@mui/icons-material/Star";

const HorizontalScroller = ({
  games,
  title,
  linkTo,
  linkText = "Смотреть ещё",
}) => {
  if (!games || games.length === 0) return null;

  return (
    <div className="horizontal-scroller-section">
      <div className="section-header">
        <h2>{title}</h2>
        <Link to={linkTo} className="see-more-btn">
          {linkText}
        </Link>
      </div>

      <div className="scroller-container">
        {games.map((game) => (
          <div key={game.id} className="game-card-item">
            <Link to={`/games/${game.slug}`}>
              <div className="poster">
                <img
                  src={game.background_image || "/img/default.jpg"}
                  alt={game.title}
                  loading="lazy"
                />
              </div>
              <h3 className="game-title">{game.title}</h3>

              {Number(game.rating) > 0 && (
                <div className="rating">
                  <StarIcon className="star" />
                  <span>{Number(game.rating).toFixed(1)}</span>
                </div>
              )}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HorizontalScroller;

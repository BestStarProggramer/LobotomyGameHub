import "./mainGameCard.scss";
import { Link } from "react-router-dom";
import StarIcon from "@mui/icons-material/Star";

const MainGameCard = ({ game }) => {
  const { id, slug, title, description, genres = [], rating, imageUrl } = game;

  const linkTo = slug ? `/games/${slug}` : `/games/${id}`;

  return (
    <div className="main-game-card">
      <div className="left">
        <div className="poster_wrapper">
          <img src={imageUrl} alt={title} />
        </div>
        <div className="rating">
          <span>{rating}</span>
          <StarIcon className="star" />
        </div>
      </div>
      <div className="right">
        <h1>{title}</h1>
        <div className="description">
          <p>{description}</p>
        </div>
        <div className="genres">
          {genres.map((genre, index) => (
            <span key={index} className="genre-tag">
              {typeof genre === "string" ? genre : genre.name}
            </span>
          ))}
        </div>
        <Link to={linkTo} className="game-button">
          Открыть страницу игры
        </Link>
      </div>
    </div>
  );
};

export default MainGameCard;

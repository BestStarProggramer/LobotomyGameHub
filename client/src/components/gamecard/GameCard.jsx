import "./gameCard.scss";
import { Link } from "react-router-dom";

const GameCard = ({ game }) => {
  const { slug, title, background_image } = game;

  return (
    <div className="game-card">
      <Link to={`/games/${slug}`}>
        <div className="game-poster-small">
          <img src={background_image || "/img/default.jpg"} alt={title} />
        </div>
        <h3>{title}</h3>
      </Link>
    </div>
  );
};

export default GameCard;

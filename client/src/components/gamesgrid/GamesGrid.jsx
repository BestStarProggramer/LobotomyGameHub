import "./gamesGrid.scss";
import { Link } from "react-router-dom";
import StarIcon from "@mui/icons-material/Star";

const GamesGrid = ({ games }) => {
  return (
    <div className="games-grid">
      {games.map((game) => (
        <div key={game.slug} className="game-card">
          <Link to={`/games/${game.slug}`}>
            <div className="game-poster">
              <img
                loading="lazy"
                src={game.background_image || "/img/default.jpg"}
                alt={game.title}
              />
            </div>
            <h3>{game.title}</h3>
            {game.rating > 0 && (
              <div className="game-rating">
                <StarIcon />
                {game.rating}
              </div>
            )}
          </Link>
        </div>
      ))}
    </div>
  );
};

export default GamesGrid;

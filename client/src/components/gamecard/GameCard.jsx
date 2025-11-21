import "./gameCard.scss";
import { Link } from "react-router-dom";

const GameCard = ({ game }) => {
	const { id, title, imageUrl } = game;

	return (
		<div className="game-card">
			<Link to={`/games/${id}`}>
				<div className="game-poster-small">
					<img src={imageUrl} alt={title} />
				</div>
				<h3>{title}</h3>
			</Link>
		</div>
	);
};

export default GameCard;

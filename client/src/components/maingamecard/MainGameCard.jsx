import "./mainGameCard.scss";
import { Link } from "react-router-dom";
import StarIcon from "@mui/icons-material/Star";

const MainGameCard = ({ game }) => {
	const { id, title, description, genres, rating, imageUrl } = game;

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
						<span
							key={index}
							className="genre-tag"
						>
							{genre}
						</span>
					))}
				</div>
				<Link
					to={`/games/${id}`}
					className="game-button"
				>
					Открыть страницу игры
				</Link>
			</div>
		</div>
	);
};

export default MainGameCard;

import "./gameBlock.scss";
import GameCard from "../gamecard/GameCard";

const GameBlock = ({ title, games }) => {
	return (
		<section className="game-block">
			<h2>{title}</h2>
			<div className="games-grid">
				{games.map((game) => (
					<GameCard key={game.id} game={game} />
				))}
			</div>
		</section>
	);
};

export default GameBlock;

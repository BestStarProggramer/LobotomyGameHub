import "./gameBlock.scss";
import GameCard from "../gamecard/GameCard";

const GameBlock = ({ games }) => {
	return (
		<section className="game-block">
			<div className="games-grid">
				{games.map((game) => (
					<GameCard key={game.id} game={game} />
				))}
			</div>
		</section>
	);
};

export default GameBlock;

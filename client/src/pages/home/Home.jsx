import "./home.scss";
import { Link } from "react-router-dom";
import StarIcon from "@mui/icons-material/Star";

const Home = () => {
	// Заглушки данных для трендовой игры
	const trendingGame = {
		id: 1,
		title: "Silent Hill f",
		description:
			"Родной город Хинако окутан туманом, что заставляет ее сражаться с гротескными монстрами и решать жуткие головоломки. Раскройте волнующую красоту, скрытую в ужасе.",
		genres: ["Суравйвал хоррор", "Психологический хоррор"],
		rating: 4.3,
		imageUrl: "/img/game_poster.jpg",
	};

	// Заглушки для новинок
	const newGames = [
		{
			id: 2,
			title: "Dying Light: The Beast",
			imageUrl: "/img/game_poster.jpg",
		},
		{
			id: 3,
			title: "Borderlands 4",
			imageUrl: "/img/game_poster.jpg",
		},
		{
			id: 4,
			title: "No, I'm not a Human",
			imageUrl: "/img/game_poster.jpg",
		},
		{
			id: 5,
			title: "Hollow Knight: Silksong",
			imageUrl: "/img/game_poster.jpg",
		},
		{ id: 6, title: "Ght", imageUrl: "/img/game_poster.jpg" },
	];

	// Заглушки для рекомендуемых
	const recommendedGames = [
		{
			id: 7,
			title: "Mесла chaos",
			imageUrl: "/img/game_poster.jpg",
		},
		{
			id: 8,
			title: "WARSCREWDRIVER 42K",
			imageUrl: "/img/game_poster.jpg",
		},
		{
			id: 9,
			title: "pakingo@RE",
			imageUrl: "/img/game_poster.jpg",
		},
		{
			id: 10,
			title: "Длинное название чтобы показать перенос",
			imageUrl: "/img/game_poster.jpg",
		},
		{
			id: 11,
			title: "Cyberpunk 2077",
			imageUrl: "/img/game_poster.jpg",
		},
	];

	return (
		<div className="home">
			<div className="container">
				{/* Блок "Сейчас в тренде" */}
				<section className="trending-section">
					<h2>Сейчас в тренде</h2>
					<div className="trending-game">
						<div className="game-poster">
							<img
								src={
									trendingGame.imageUrl
								}
								alt={
									trendingGame.title
								}
							/>
						</div>
						<div className="game-info">
							<h1>
								{
									trendingGame.title
								}
							</h1>
							<p>
								{
									trendingGame.description
								}
							</p>
							<div className="genres">
								{trendingGame.genres.map(
									(
										genre,
										index
									) => (
										<span
											key={
												index
											}
											className="genre-tag"
										>
											{
												genre
											}
										</span>
									)
								)}
							</div>
							<div className="rating-section">
								<div className="rating">
									<span className="rating-value">
										{
											trendingGame.rating
										}
									</span>
									<StarIcon className="star-icon" />
								</div>
								<Link
									to={`/games/${trendingGame.id}`}
									className="game-button"
								>
									Открыть
									страницу
									игры
								</Link>
							</div>
						</div>
					</div>
				</section>

				{/* Блок "Новинки" */}
				<section className="new-releases-section">
					<h2>Новинки</h2>
					<div className="games-grid">
						{newGames.map((game) => (
							<Link
								key={game.id}
								to={`/games/${game.id}`}
								className="game-card"
							>
								<div className="game-poster-small">
									<img
										src={
											game.imageUrl
										}
										alt={
											game.title
										}
									/>
								</div>
								<h3>
									{
										game.title
									}
								</h3>
							</Link>
						))}
					</div>
				</section>

				{/* Блок "Рекомендуем" */}
				<section className="recommended-section">
					<h2>Рекомендуем</h2>
					<div className="games-grid">
						{recommendedGames.map(
							(game) => (
								<Link
									key={
										game.id
									}
									to={`/games/${game.id}`}
									className="game-card"
								>
									<div className="game-poster-small">
										<img
											src={
												game.imageUrl
											}
											alt={
												game.title
											}
										/>
									</div>
									<h3>
										{
											game.title
										}
									</h3>
								</Link>
							)
						)}
					</div>
				</section>
			</div>
		</div>
	);
};

export default Home;

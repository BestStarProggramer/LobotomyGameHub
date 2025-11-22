import "./home.scss";
import MainGameCard from "../../components/maingamecard/MainGameCard";
import GameBlock from "../../components/gameblock/GameBlock";

const Home = () => {
	// Заглушка для трендовой игры
	const trendingGame = {
		id: 1,
		title: "Silent Hill f",
		description:
			"Родной город Хинако окутан туманом, что заставляет ее сражаться с гротескными монстрами и решать жуткие головоломки. Раскройте волнующую красоту, скрытую в ужасе.",
		genres: ["Суравйвал хоррор", "Психологический хоррор"],
		rating: 4.3,
		imageUrl: "/img/game_poster.jpg",
	};

	// Заглушки данных для списков
	const recentlyAddedGames = [
		{
			id: 12,
			title: "Elden Ring: Shadow",
			imageUrl: "/img/game_poster.jpg",
		},
		{
			id: 13,
			title: "Stellar Blade",
			imageUrl: "/img/game_poster.jpg",
		},
		{
			id: 14,
			title: "Final Fantasy VII Rebirth",
			imageUrl: "/img/game_poster.jpg",
		},
		{
			id: 15,
			title: "Like a Dragon: Infinite Wealth",
			imageUrl: "/img/game_poster.jpg",
		},
		{
			id: 16,
			title: "Persona 3 Reload",
			imageUrl: "/img/game_poster.jpg",
		},
	];

	const popularGames = [
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
			title: "Длинное название",
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
					<MainGameCard game={trendingGame} />
				</section>

				{/* Остальные блоки */}
				<h2 className="section-title">
					Недавно добавленные
				</h2>
				<GameBlock games={recentlyAddedGames} />

				<h2 className="section-title">Популярные</h2>
				<GameBlock games={popularGames} />

				<h2 className="section-title">Рекомендуемые</h2>
				<GameBlock games={recommendedGames} />
			</div>
		</div>
	);
};

export default Home;

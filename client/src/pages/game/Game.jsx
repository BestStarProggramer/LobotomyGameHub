import "./game.scss";
import { Link } from "react-router-dom";
import StarIcon from "@mui/icons-material/Star";
import Review from "../../components/review/Review";

const Game = () => {
	// Данные для одного отзыва
	const review = {
		id: 1,
		username: "5Hnet5K",
		avatar: "/img/profilePic.jpg",
		rating: "4.3",
		date: "03.11.2025",
		content: "Бла бла бла мне лень придумывать текст обзора поэтому Lorem ipsum dolor sit amet consectetur adipisicing elit. Impedit, minima repellendus. Reiciendis, vero tenetur. Modi quam saepe et tempora assumenda, molestias deleniti quia, incidunt ratione ut in maxime? Impedit, unde!",
	};

	return (
		<div className="game">
			<div className="game_wrapper">
				<div className="banner">
					<img
						src="/img/game_banner.jpg"
						alt="Баннер игры"
					/>
				</div>

				<div className="info">
					<div className="top">
						<div className="left">
							<div className="poster_wrapper">
								<img
									src="/img/game_poster.jpg"
									alt="Постер игры"
								/>
							</div>

							<div className="rating">
								<span>4.3</span>
								<StarIcon className="star" />
							</div>
						</div>

						<div className="right">
							<h1>
								Hollow Knight:
								Silksong
							</h1>
							<div className="description">
								<p>
									Исследуйте
									огромное
									проклятое
									царство
									в Hollow
									Knight:
									Silksong!
									Открывайте
									его
									тайны,
									сражайтесь
									и
									боритесь
									за свою
									жизнь,
									поднимаясь
									к
									вершинам
									земель,
									где
									правят
									шёлк и
									песня.
								</p>
							</div>
						</div>
					</div>

					<div className="bottom">
						<h2>Трейлер игры</h2>
						<div className="sections">
							<div className="left">
								<video
									src="/videos/trailer.mp4"
									controls
								/>
							</div>

							<div className="right">
								<div className="articles_wrapper">
									<div className="article">
										<div className="top">
											<h1>
												Все
												секреты
												начальной
												локации
												Silksong
											</h1>
											<div className="author">
												<span>
													5Hnet5K
												</span>
												<img
													src="/img/profilePic.jpg"
													alt="аватар"
												/>
											</div>
										</div>

										<div className="bottom">
											<p>
												Прошло
												не
												так
												много
												времени
												с
												релиза
												долгожданного
												сиквела
												Hollow
												Knight,
												но
												игроки
												уже
												отыскали
												довольно
												внушительное
												количество
												разнообразных
												секретов,
												причем
												на
												самой
												первой
												локации.
												Проведя
												небольшое
												исследование
												всех
												доступных
												материалов
												по
												этой
												теме,
												я
												составил
												полный
												список
												абсолютно
												всех...
											</p>
											<Link
												to="/article/1"
												className="read_more"
											>
												<p>
													Открыть
													статью
												</p>
											</Link>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="reviews_section">
				<div className="top">
					<h1>Отзывы</h1>
					<Link
						to="/games/:gameId/reviews"
						className="button_reviews"
					>
						<p>На страницу с отзывами →</p>
					</Link>
				</div>

				<div className="bottom">
					<Review review={review} />
				</div>
			</div>
		</div>
	);
};

export default Game;

import "./game.scss";

const Game = () => {
	return (
		<div
			className="game"
			style={{
				backgroundImage: `url("/img/background.png")`,
			}}
		>
			<div className="container">
				<div className="banner">
					<img
						src="/img/game-poster.png"
						alt="Постер игры"
					/>
				</div>

				<div className="main">
					<div className="info">
						<div className="left">
							<img
								src="/img/game-logo.jpg"
								alt="Логотип игры"
								className="logo"
							/>
							<div className="rating">
								<span>4.2</span>
								<img
									src="/img/star.png"
									alt="Звезда"
									className="star"
								/>
							</div>
						</div>

						<div className="right">
							<h1>
								Hollow Knight:
								Silksong
							</h1>
							<div className="description">
								<p>
									В
									долгожданном
									продолжении
									Hollow
									Knight
									вы
									играете
									за
									Хорнэт —
									хранительницу
									зала,
									оказавшуюся
									в новом
									королевстве,
									полном
									насекомых
									и тайн.
								</p>
							</div>
						</div>
					</div>

					<div className="bottom">
						<div className="video">
							<video
								controls
								width="100%"
							>
								<source
									src="/videos/trailer.mp4"
									type="video/mp4"
								/>
								Ваш браузер не
								поддерживает
								видео.
							</video>
						</div>

						<div className="actions">
							<button className="button primary">
								Написать обзор
							</button>
							<button className="button secondary">
								Посмотреть
								обзоры
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Game;

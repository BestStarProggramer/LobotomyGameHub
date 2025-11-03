import "./game.scss";
import { Link } from "react-router-dom";
import StarIcon from "@mui/icons-material/Star";

const Game = () => {
  return (
    <div className="game">
      <div className="page_wrapper">
        <div className="general_info">
          <div className="banner">
            <img src="/img/game_banner.jpg" alt="Баннер игры" />
          </div>

          <div className="info">
            <div className="top">
              <div className="left">
                <div className="poster_wrapper">
                  <img src="/img/game_poster.jpg" alt="Постер игры" />
                </div>

                <div className="rating">
                  <span>4.3</span>
                  <StarIcon className="star" />
                </div>
              </div>

              <div className="right">
                <h1>Hollow Knight: Silksong</h1>
                <div className="description">
                  <p>
                    Исследуйте огромное проклятое царство в Hollow Knight:
                    Silksong! Открывайте его тайны, сражайтесь и боритесь за
                    свою жизнь, поднимаясь к вершинам земель, где правят шёлк и
                    песня.
                  </p>
                </div>
              </div>
            </div>

            <div className="bottom">
              <div className="left">
                <div className="trailer">
                  {/* <video src="/videos/trailer.mp4" controls /> */}
                </div>
              </div>

              <div className="right">
                <div className="articles_wrapper">
                  <div className="article">
                    <div className="top">
                      <h1>Все секреты начальной локации Silksong</h1>
                      <div className="author">
                        <img src="/img/profilePic.jpg" alt="аватар" />
                        <span>5Hnet5K</span>
                      </div>
                    </div>

                    <div className="bottom">
                      <p>
                        Прошло не так много времени с релиза долгожданного
                        сиквела Hollow Knight, но игроки уже отыскали довольно
                        внушительное количество разнообразных секретов...
                      </p>
                      <Link to="/article/1" className="read_more">
                        Читать далее...
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="reviews_section">
            <div className="top">
              <h1>Отзывы</h1>
              <Link to="/games/:gameId/reviews" className="button_reviews">
                <p>На страницу с отзывами</p>
              </Link>
            </div>

            <div className="bottom">
              <div className="review">
                <div className="top">
                  <div className="author">
                    <img src="/img/profilePic" alt="аватар" />
                    <span>5Hnet5K</span>
                  </div>

                  <div className="rating">
                    <div className="date">
                      <p>03.11.2025</p>
                    </div>
                    <div className="value">
                      <StarIcon className="star" />
                      <span>4.3</span>
                    </div>
                  </div>
                </div>

                <div className="bottom">
                  <p>
                    Бла бла бла мне лень придумывать текст обзора поэтому Lorem
                    ipsum dolor sit amet consectetur adipisicing elit. Impedit,
                    minima repellendus. Reiciendis, vero tenetur. Modi quam
                    saepe et tempora assumenda, molestias deleniti quia,
                    incidunt ratione ut in maxime? Impedit, unde!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Game;

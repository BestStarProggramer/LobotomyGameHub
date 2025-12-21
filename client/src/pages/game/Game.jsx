import "./game.scss";
import { Link, useParams } from "react-router-dom";
import StarIcon from "@mui/icons-material/Star";
import ReviewsBlock from "../../components/reviewsblock/ReviewsBlock";
import { AuthContext } from "../../context/authContext";
import { useContext, useEffect, useState } from "react";
import {
  fetchGameDetailsBySlug,
  fetchGameScreenshotsBySlug,
} from "../../utils/rawg"

const Game = () => {
  const { currentUser } = useContext(AuthContext);
  const { GameId } = useParams(); // slug from url
  const [game, setGame] = useState(null);
  const [bannerUrl, setBannerUrl] = useState("/img/gamebanner.jpg");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reviewsList = [
    {
      id: 1,
      username: "5Hnet5K",
      avatar: "/img/profilePic.jpg",
      rating: "4",
      date: "03.11.2025",
      content:
        "Прошло не так много времени с релиза долгожданного сиквела Hollow Knight, но игроки уже отыскали довольно внушительное количество разнообразных секретов, причем на самой первой локации. Проведя небольшое исследование всех доступных материалов по этой теме, я составил полный список абсолютно всех...",
    },
    {
      id: 2,
      username: "ShadowHunter",
      avatar: "/img/default-avatar.jpg",
      rating: "5",
      date: "05.11.2025",
      content:
        "Игра просто невероятна! Сюжет захватывает с первых минут, а графика на высшем уровне. Всем советую, это настоящий шедевр в жанре. С нетерпением жду дополнений и обновлений.",
    },
    {
      id: 3,
      username: "QuickLearner",
      avatar: "/img/profilePic.jpg",
      rating: "3",
      date: "08.11.2025",
      content:
        "Хорошая, но не идеальная. Есть некоторые проблемы с балансом и оптимизацией, но в целом оставляет приятное впечатление. Игра определенно заслуживает внимания, но требует небольшой доработки.",
    },
  ];

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const details = await fetchGameDetailsBySlug(GameId);
        const shots = await fetchGameScreenshotsBySlug(GameId);
        
        if (cancelled) return;

        setGame(details);

        const nextBanner = 
          (Array.isArray(shots) && shots[0]) ||
          details?.backgroundimage ||
          "/img/gamebanner.jpg";

        setBannerUrl(nextBanner);
      } catch (e){
        if (!cancelled) setError("Не удалось загрузить игру");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    
    if (GameId) load();
    
    return () => {
      cancelled = true;
    };
  },[GameId]);
  
  if (loading) {
    return (
      <div className="game">
        <div className="gamewrapper" style={{ color: "white"}}>
          Загрузка...
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="game">
        <div className="gamewrapper" style ={{ color: "white"}}>
        {error}
        </div>
      </div>
    );
  }

  const posterUrl=game?.backgroundimage || "/img/gameposter.jpg";
  const title= game?.title || "";
  const description=game?.description || "";
  const rating= Number(game?.rating || 0).toFixed(1);

  return (
    <div className="game">
      <div className="game_wrapper">
        <div className="banner">
          <img src={bannerUrl} alt={title} />
        </div>

        <div className="info">
          <div className="top">
            <div className="left">
              <div className="poster_wrapper">
                <img src={posterUrl} alt={title} />
              </div>

              <div className="rating">
                <span>{rating}</span>
                <StarIcon className="star" />
              </div>
            </div>

            <div className="right">
              <h1>{title}</h1>
              <div className="description">
                <p> {description || "Описание отсутствует."}</p>
              </div>
            </div>
          </div>

          <div className="bottom">
            <h2>Трейлер игры</h2>
            <div className="sections">
              <div className="left">
                <video src="/videos/trailer.mp4" controls />
              </div>

              <div className="right">
                <div className="articles_wrapper">
                  <div className="article">
                    <div className="top">
                      <h1>{title || "Статья"}</h1>
                      <div className="author">
                        <span>5Hnet5K</span>
                        <img src="/img/profilePic.jpg" alt="аватар" />
                      </div>
                    </div>

                    <div className="bottom">
                      <p>
                        Прошло не так много времени с релиза долгожданного
                        сиквела Hollow Knight, но игроки уже отыскали довольно
                        внушительное количество разнообразных секретов, причем
                        на самой первой локации. Проведя небольшое исследование
                        всех доступных материалов по этой теме, я составил
                        полный список абсолютно всех...
                      </p>
                      <Link to="/article/1" className="read_more">
                        <p>Открыть статью</p>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="reviews-container">
        <ReviewsBlock
          reviews={reviewsList}
          buttonText="На страницу с отзывами →"
          buttonLink={`/games/${GameId}/reviews`}
          showReviewInput={currentUser}
        />
      </div>
    </div>
  );
};

export default Game;

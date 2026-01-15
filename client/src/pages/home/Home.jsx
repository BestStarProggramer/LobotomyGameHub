import "./home.scss";
import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import StarIcon from "@mui/icons-material/Star";
import HorizontalScroller from "../../components/horizontalscroller/HorizontalScroller";

const Home = () => {
  const { currentUser } = useContext(AuthContext);
  const [data, setData] = useState({
    trending: null,
    popular: [],
    recent: [],
    recommended: [],
    userGenres: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await makeRequest.get("/games/home");
        setData(res.data);
      } catch (err) {
        console.error("Failed to load home data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser]);

  if (loading) return <div className="home loading">Загрузка...</div>;

  const recentLink = `/games?localOnly=true&orderBy=created&orderDirection=desc`;
  const popularLink = `/games?localOnly=true&orderBy=popularity`;

  let recommendedLink = `/games?localOnly=true&orderBy=rating&orderDirection=desc`;
  if (data.userGenres && data.userGenres.length > 0) {
    recommendedLink += `&genres=${data.userGenres.join(",")}`;
  }

  return (
    <div className="home">
      <div className="container">
        {data.trending && (
          <section className="trending-block">
            <div className="block-title">
              <WhatshotIcon className="icon-fire" />
              <h1>В тренде</h1>
            </div>

            <div className="trending-card">
              <div className="trending-banner">
                <img
                  src={data.trending.background_image || "/img/default.jpg"}
                  alt={data.trending.title}
                />
                {data.trending.rating > 0 && (
                  <div className="trending-rating">
                    <span>{data.trending.rating}</span>
                    <StarIcon />
                  </div>
                )}
              </div>

              <div className="trending-info">
                <h2>{data.trending.title}</h2>
                <p className="description">
                  {data.trending.description || "Описание отсутствует."}
                </p>

                <div className="genres">
                  {data.trending.genres?.map((g) => (
                    <span key={g.id} className="genre-tag">
                      {g.name}
                    </span>
                  ))}
                </div>

                <Link to={`/games/${data.trending.slug}`} className="open-btn">
                  Открыть страницу игры
                </Link>
              </div>
            </div>
          </section>
        )}

        <HorizontalScroller
          games={data.recent}
          title="Недавно добавленные"
          linkTo={recentLink}
        />

        <HorizontalScroller
          games={data.popular}
          title="Популярные"
          linkTo={popularLink}
        />

        <HorizontalScroller
          games={data.recommended}
          title="Рекомендуемые"
          linkTo={recommendedLink}
        />
      </div>
    </div>
  );
};

export default Home;

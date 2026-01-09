import "./userReviews.scss";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import ReviewsList from "../../components/reviewslist/ReviewsList";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const UserReviews = () => {
  const { UserId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const offset = (page - 1) * PAGE_SIZE;
        const res = await axios.get(
          `http://localhost:8800/api/reviews/user/${UserId}?limit=${PAGE_SIZE}&offset=${offset}`,
          { withCredentials: true }
        );

        const mappedReviews = res.data.map((r) => ({
          ...r,
          date: new Date(r.created_at).toLocaleDateString("ru-RU"),
        }));

        if (mappedReviews.length < PAGE_SIZE) {
          setHasMore(false);
        }

        setReviews((prev) =>
          page === 1 ? mappedReviews : [...prev, ...mappedReviews]
        );
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user reviews:", err);
        setLoading(false);
      }
    };

    fetchReviews();
  }, [UserId, page]);

  return (
    <div className="user-reviews-page">
      <div className="container">
        <div className="header">
          <Link to={`/profile/${UserId}`} className="back-link">
            <ArrowBackIcon /> Назад к профилю
          </Link>
          <h1>Все отзывы пользователя</h1>
        </div>

        {loading && page === 1 ? (
          <div className="loading">Загрузка...</div>
        ) : (
          <>
            <ReviewsList reviews={reviews} />

            {hasMore && (
              <div className="load-more-container">
                <button
                  className="load-more-btn"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={loading}
                >
                  {loading ? "Загрузка..." : "Показать еще"}
                </button>
              </div>
            )}

            {reviews.length === 0 && !loading && (
              <div className="no-data">Отзывов пока нет</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserReviews;

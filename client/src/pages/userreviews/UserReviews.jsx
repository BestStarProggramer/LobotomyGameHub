import "./userReviews.scss";
import { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import ReviewsList from "../../components/reviewslist/ReviewsList";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { AuthContext } from "../../context/authContext";

const UserReviews = () => {
  const { UserId } = useParams();
  const { currentUser } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;

  const isOwnProfile = currentUser && currentUser.id === parseInt(UserId);

  useEffect(() => {
    const fetchUserName = async () => {
      if (!UserId) return;
      try {
        const res = await axios.get(
          `http://localhost:8800/api/auth/user/${UserId}`
        );
        setUserName(res.data.username || "пользователя");
      } catch (err) {
        console.error("Ошибка загрузки имени пользователя:", err);
        setUserName("пользователя");
      }
    };

    fetchUserName();
  }, [UserId]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const offset = (page - 1) * PAGE_SIZE;
        const res = await axios.get(
          `http://localhost:8800/api/reviews/user/${UserId}?limit=${PAGE_SIZE}&offset=${offset}`
        );

        const mappedReviews = res.data.map((r) => ({
          ...r,
          date: new Date(r.created_at).toLocaleDateString("ru-RU"),
          user_id: r.user_id || UserId,
        }));

        console.log("Loaded reviews:", mappedReviews);

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

  const handleDeleteReview = async (reviewId) => {
    if (!reviewId || !isOwnProfile) {
      console.log("Cannot delete: no reviewId or not own profile");
      return;
    }

    try {
      const reviewToDelete = reviews.find((r) => r.id === reviewId);
      if (!reviewToDelete) {
        alert("Отзыв не найден");
        return;
      }

      console.log(
        "Deleting review:",
        reviewId,
        "game:",
        reviewToDelete.game?.id
      );

      await axios.delete(
        `http://localhost:8800/api/reviews/game/${reviewToDelete.game?.id}/${reviewId}`,
        {
          withCredentials: true,
        }
      );

      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      alert("Отзыв успешно удален");
    } catch (err) {
      console.error("Error deleting review:", err.response?.data || err);
      alert(
        "Не удалось удалить отзыв: " +
          (err.response?.data?.error || err.message)
      );
    }
  };

  return (
    <div className="user-reviews-page">
      <div className="container">
        <div className="header">
          <Link to={`/profile/${UserId}`} className="back-link">
            <ArrowBackIcon /> Назад к профилю
          </Link>
          <h1>Все отзывы {userName}</h1>
        </div>

        {loading && page === 1 ? (
          <div className="loading">Загрузка...</div>
        ) : (
          <>
            <ReviewsList
              reviews={reviews}
              onDelete={isOwnProfile ? handleDeleteReview : null}
              currentUserId={currentUser?.id}
              hideDelete={!isOwnProfile}
            />

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

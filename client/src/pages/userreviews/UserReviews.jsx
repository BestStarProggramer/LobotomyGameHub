import "./userReviews.scss";
import { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import ReviewsList from "../../components/reviewslist/ReviewsList";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { AuthContext } from "../../context/authContext";
import { ModalContext } from "../../context/modalContext";

const UserReviews = () => {
  const { UserId } = useParams();
  const { currentUser } = useContext(AuthContext);
  const { openModal } = useContext(ModalContext);

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;

  const isOwnProfile = currentUser && String(currentUser.id) === String(UserId);
  const isAdmin = currentUser?.role === "admin";
  const canDelete = isOwnProfile || isAdmin;

  useEffect(() => {
    const fetchUserName = async () => {
      if (!UserId) return;
      try {
        const res = await axios.get(
          `http://localhost:8800/api/auth/user/${UserId}`
        );
        setUserName(res.data.username || "пользователя");
      } catch (err) {
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
        if (mappedReviews.length < PAGE_SIZE) setHasMore(false);
        setReviews((prev) =>
          page === 1 ? mappedReviews : [...prev, ...mappedReviews]
        );
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [UserId, page]);

  const handleDeleteReview = (reviewId) => {
    if (!reviewId || !canDelete) return;

    openModal(
      "Удаление отзыва",
      "Вы действительно хотите удалить этот отзыв?",
      async () => {
        try {
          const reviewToDelete = reviews.find((r) => r.id === reviewId);
          if (!reviewToDelete) return;

          await axios.delete(
            `http://localhost:8800/api/reviews/game/${reviewToDelete.game?.id}/${reviewId}`,
            { withCredentials: true }
          );

          setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        } catch (err) {
          console.error("Error deleting review:", err);
        }
      }
    );
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
              onDelete={canDelete ? handleDeleteReview : null}
              currentUserId={currentUser?.id}
              hideDelete={!canDelete}
              isAdmin={isAdmin}
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

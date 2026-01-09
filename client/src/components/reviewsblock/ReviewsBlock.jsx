import "./reviewsBlock.scss";
import { Link } from "react-router-dom";
import ReviewsList from "../reviewslist/ReviewsList";
import ReviewInput from "../reviewinput/ReviewInput";
import {
  useState,
  useContext,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { AuthContext } from "../../context/authContext";
import { makeRequest } from "../../axios";

const ReviewsBlock = ({
  reviews = [],
  buttonText,
  buttonLink,
  showReviewInput = false,
  gameId = null,
  gameSlug = null,
  initialLimit = 5,
  infinite = false,
}) => {
  const [localReviews, setLocalReviews] = useState(reviews || []);
  const { currentUser } = useContext(AuthContext);

  const pageRef = useRef(0);
  const pageSize = initialLimit || 5;
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const currentUserRef = useRef(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    let mounted = true;
    const loadInitial = async () => {
      if (!gameId) return;
      try {
        pageRef.current = 0;
        const res = await makeRequest.get(
          `reviews/game/${gameId}?limit=${pageSize}&offset=0`
        );
        if (!mounted) return;
        const mapped = res.data.map((r) => ({
          id: r.id,
          username: r.username,
          user_id: r.user_id,
          avatar: r.avatar || "/img/default-avatar.jpg",
          rating: r.rating,
          date: new Date(r.created_at).toLocaleDateString("ru-RU"),
          content: r.content,
        }));
        setLocalReviews(mapped);
        setHasMore(mapped.length >= pageSize);
      } catch (err) {
        console.error(
          "Не удалось загрузить отзывы:",
          err.response?.data || err
        );
      }
    };
    loadInitial();
    return () => (mounted = false);
  }, [gameId, pageSize]);

  const loadMore = useCallback(async () => {
    if (!gameId || loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = pageRef.current + 1;
      const offset = nextPage * pageSize;
      const res = await makeRequest.get(
        `reviews/game/${gameId}?limit=${pageSize}&offset=${offset}`
      );
      const mapped = (res.data || []).map((r) => ({
        id: r.id,
        username: r.username,
        user_id: r.user_id,
        avatar: r.avatar || "/img/default-avatar.jpg",
        rating: r.rating,
        date: new Date(r.created_at).toLocaleDateString("ru-RU"),
        content: r.content,
      }));
      if (mapped.length > 0) {
        setLocalReviews((prev) => [...prev, ...mapped]);
        pageRef.current = nextPage;
        setHasMore(mapped.length >= pageSize);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Ошибка подгрузки отзывов:", err.response?.data || err);
    } finally {
      setLoadingMore(false);
    }
  }, [gameId, loadingMore, hasMore, pageSize]);

  const sentinelRef = useRef(null);
  useEffect(() => {
    if (!infinite) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadMore();
          }
        });
      },
      { root: null, rootMargin: "0px", threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [infinite, loadMore]);

  const handleReviewSubmit = async (reviewData) => {
    const user = currentUserRef.current;
    if (!user) {
      console.error("Пользователь не авторизован");
      return;
    }

    if (!gameId) {
      console.error("gameId отсутствует");
      return;
    }

    try {
      const payload = {
        rating: reviewData.rating,
        content: reviewData.content,
      };
      const res = await makeRequest.post(`reviews/game/${gameId}`, payload);
      const createdAt = res.data.created_at
        ? new Date(res.data.created_at)
        : new Date();
      const newReview = {
        id: res.data.id || Date.now(),
        username: user.username,
        user_id: user.id,
        avatar: user.avatar_url || "/img/default-avatar.jpg",
        rating: reviewData.rating,
        date: createdAt.toLocaleDateString("ru-RU"),
        content: reviewData.content,
      };

      setLocalReviews((prev) => [newReview, ...prev]);
    } catch (err) {
      console.error("Ошибка при сохранении отзыва:", err.response?.data || err);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!gameId || !reviewId) return;
    try {
      await makeRequest.delete(`reviews/game/${gameId}/${reviewId}`);
      setLocalReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err) {
      console.error("Ошибка удаления отзыва:", err.response?.data || err);
      alert("Не удалось удалить отзыв");
    }
  };

  const sortedReviews = useMemo(() => {
    if (!currentUser) return localReviews;

    const userReview = localReviews.find(
      (r) => Number(r.user_id) === Number(currentUser.id)
    );
    const otherReviews = localReviews.filter(
      (r) => Number(r.user_id) !== Number(currentUser.id)
    );

    return userReview ? [userReview, ...otherReviews] : localReviews;
  }, [localReviews, currentUser]);

  const hasUserReview = useMemo(() => {
    return (
      currentUser &&
      localReviews.some((r) => Number(r.user_id) === Number(currentUser.id))
    );
  }, [localReviews, currentUser]);

  const shouldShowReviewInputContainer = useMemo(() => {
    if (!currentUser) return true;

    if (!hasUserReview) return true;

    return false;
  }, [currentUser, hasUserReview]);

  return (
    <div className="reviews_section">
      <div className="top">
        <h1>Отзывы</h1>

        {buttonText && buttonLink && (
          <Link to={buttonLink} className="button_reviews">
            <p>{buttonText}</p>
          </Link>
        )}
      </div>

      {shouldShowReviewInputContainer && (
        <div className="review-input-container">
          {!currentUser ? (
            <div className="guest-review-block">
              <div className="blur-overlay"></div>

              <div className="review-form-preview">
                <textarea
                  className="preview-textarea"
                  placeholder="Напишите ваш отзыв..."
                  rows="4"
                  disabled
                />

                <div className="rating-section preview">
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="star preview">
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="rating-text preview">Поставьте оценку</span>
                </div>

                <div className="review-actions preview">
                  <button className="submit-btn preview" disabled>
                    Отправить
                  </button>
                  <button className="cancel-btn preview" disabled>
                    Отмена
                  </button>
                </div>
              </div>

              <div className="guest-message">
                <Link to="/login" className="login-button">
                  Войдите, чтобы оставить отзыв
                </Link>
              </div>
            </div>
          ) : (
            <ReviewInput onSubmit={handleReviewSubmit} onCancel={() => {}} />
          )}
        </div>
      )}

      <div className="bottom">
        <ReviewsList
          reviews={sortedReviews}
          onDelete={handleDeleteReview}
          currentUserId={currentUser?.id}
          hideDelete={false}
        />

        {infinite && hasMore && (
          <div ref={sentinelRef} className="loading-indicator">
            {loadingMore ? "Загрузка..." : "Прокрутите вниз для загрузки..."}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsBlock;

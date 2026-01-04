import "./reviewsBlock.scss";
import { Link } from "react-router-dom";
import ReviewsList from "../reviewslist/ReviewsList";
import ReviewInput from "../reviewinput/ReviewInput";
import { useState, useContext, useRef, useEffect } from "react";
import { AuthContext } from "../../context/authContext";
import { makeRequest } from "../../axios";

const ReviewsBlock = ({
  reviews = [],
  buttonText,
  buttonLink,
  showReviewInput = false,
  gameId = null,
  initialLimit = 5,
}) => {
  const [localReviews, setLocalReviews] = useState(reviews);
  const { currentUser } = useContext(AuthContext);

  const currentUserRef = useRef(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!gameId) return;
      try {
        const res = await makeRequest.get(
          `reviews/game/${gameId}?limit=${initialLimit}`
        );
        if (!mounted) return;

        const mapped = res.data.map((r) => ({
          id: r.id,
          username: r.username,
          avatar: r.avatar || "/img/default-avatar.jpg",
          rating: r.rating,
          date: new Date(r.created_at).toLocaleDateString("ru-RU"),
          content: r.content,
        }));
        setLocalReviews(mapped);
      } catch (err) {
        console.error(
          "Не удалось загрузить отзывы:",
          err.response?.data || err
        );
      }
    };
    load();
    return () => (mounted = false);
  }, [gameId, initialLimit]);

  const handleReviewSubmit = async (reviewData) => {
    const user = currentUserRef.current;
    if (!user) {
      console.error("Пользователь не авторизован");
      return;
    }

    if (gameId) {
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
          avatar: user.avatar_url || "/img/default-avatar.jpg",
          rating: reviewData.rating,
          date: createdAt.toLocaleDateString("ru-RU"),
          content: reviewData.content,
        };
        setLocalReviews((prev) => [newReview, ...prev]);
      } catch (err) {
        console.error(
          "Ошибка при сохранении отзыва:",
          err.response?.data || err
        );
      }
      return;
    }

    const newReview = {
      id: Date.now(),
      username: user.username,
      avatar: user.avatar_url || "/img/default-avatar.jpg",
      rating: reviewData.rating,
      date: new Date().toLocaleDateString("ru-RU"),
      content: reviewData.content,
    };
    setLocalReviews((prev) => [newReview, ...prev]);
  };

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

      {showReviewInput && (
        <div className="review-input-container">
          <ReviewInput
            onSubmit={handleReviewSubmit}
            onCancel={() => console.log("Отмена")}
          />
        </div>
      )}

      <div className="bottom">
        <ReviewsList reviews={localReviews} />
      </div>
    </div>
  );
};

export default ReviewsBlock;

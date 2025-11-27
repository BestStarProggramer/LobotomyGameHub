import "./reviewInput.scss";
import { useState } from "react";
import StarIcon from "@mui/icons-material/Star";

const ReviewInput = ({ onSubmit, onCancel }) => {
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [isWriting, setIsWriting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() || rating === 0) return;

    onSubmit({
      content: content.trim(),
      rating,
    });

    setContent("");
    setRating(0);
    setIsWriting(false);
  };

  const handleCancel = () => {
    setContent("");
    setRating(0);
    setIsWriting(false);
    onCancel?.();
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    if (!isWriting) setIsWriting(true);
  };

  const handleStarClick = (starRating) => {
    setRating(starRating);
    if (!isWriting) setIsWriting(true);
  };

  return (
    <div className="review-input">
      <form className="review-form" onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder="Напишите ваш отзыв..."
          rows="4"
        />

        <div className="rating-section">
          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                className={`star ${star <= rating ? "active" : ""}`}
                onClick={() => handleStarClick(star)}
              />
            ))}
          </div>
          <span className="rating-text">
            {rating > 0 ? `Оценка: ${rating}/5` : "Поставьте оценку"}
          </span>
        </div>

        {isWriting && (
          <div className="review-actions">
            <button
              type="submit"
              className="submit-btn"
              disabled={!content.trim() || rating === 0}
            >
              Отправить
            </button>
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Отмена
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ReviewInput;

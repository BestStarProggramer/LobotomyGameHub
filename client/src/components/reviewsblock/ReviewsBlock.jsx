import "./reviewsBlock.scss";
import { Link } from "react-router-dom";
import ReviewsList from "../reviewslist/ReviewsList";
import ReviewInput from "../reviewinput/ReviewInput";
import { useState } from "react";

const ReviewsBlock = ({
  reviews,
  buttonText,
  buttonLink,
  showReviewInput = false,
}) => {
  const [localReviews, setLocalReviews] = useState(reviews);

  const handleReviewSubmit = (reviewData) => {
    const newReview = {
      id: Date.now(),
      username: "CurrentUser",
      avatar: "/img/default-avatar.jpg",
      rating: reviewData.rating,
      date: new Date().toLocaleDateString("ru-RU"),
      content: reviewData.content,
    };

    setLocalReviews((prevReviews) => [newReview, ...prevReviews]);
  };

  return (
    <div className="reviews_section">
      <div className="top">
        <h1>Отзывы</h1>
        {/* Кнопка будет, если передать buttonText и buttonLink */}
        {buttonText && buttonLink && (
          <Link to={buttonLink} className="button_reviews">
            <p>{buttonText}</p>
          </Link>
        )}
      </div>
      {/* Можно передать false и формы ввода не будет */}
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

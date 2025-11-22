import "./reviewsList.scss";
import Review from "../review/Review";

// Компонент принимает список отзывов как пропс
const ReviewsList = ({ reviews }) => {
  const reviewsToRender = Array.isArray(reviews) ? reviews : [];

  // Этот div получает стили .reviews_section
  return (
    <div className="reviews-list-wrapper">
      <div className="reviews-grid">
        {reviewsToRender.map((review) => (
          <Review key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
};

export default ReviewsList;

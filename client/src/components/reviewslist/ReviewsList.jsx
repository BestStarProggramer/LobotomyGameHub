import "./reviewsList.scss";
import Review from "../review/Review";

const ReviewsList = ({ reviews, onDelete, currentUserId }) => {
  const reviewsToRender = Array.isArray(reviews) ? reviews : [];

  return (
    <div className="reviews-list-wrapper">
      <div className="reviews-grid">
        {reviewsToRender.map((review) => (
          <Review
            key={review.id}
            review={review}
            onDelete={onDelete ? () => onDelete(review.id) : null}
            isCurrentUser={
              currentUserId && review.user_id && currentUserId == review.user_id
            }
          />
        ))}
      </div>
    </div>
  );
};

export default ReviewsList;

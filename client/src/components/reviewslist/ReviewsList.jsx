import "./reviewsList.scss";
import Review from "../review/Review";

const ReviewsList = ({
  reviews,
  onDelete,
  currentUserId,
  hideDelete = false,
}) => {
  const reviewsToRender = Array.isArray(reviews) ? reviews : [];

  return (
    <div className="reviews-list-wrapper">
      <div className="reviews-grid">
        {reviewsToRender.map((review) => (
          <Review
            key={review.id}
            review={review}
            onDelete={onDelete}
            isCurrentUser={
              currentUserId &&
              review.user_id &&
              currentUserId.toString() === review.user_id.toString()
            }
            hideDelete={hideDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default ReviewsList;

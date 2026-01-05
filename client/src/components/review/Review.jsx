import "./review.scss";
import StarIcon from "@mui/icons-material/Star";
import DeleteIcon from "@mui/icons-material/Delete";

const Review = ({ review, onDelete, isCurrentUser }) => {
  const { username, avatar, rating, date, content } = review;

  return (
    <div className="review">
      <div className="upper">
        <div className="left_side">
          <div className="author">
            <img src={avatar} alt="аватар" />
            <span>{username}</span>
          </div>

          <div className="rating">
            <div className="value">
              <span>{rating}</span>
              <StarIcon className="star" />
            </div>
          </div>
        </div>

        <div className="date">
          <p>{date}</p>
          {isCurrentUser && onDelete && (
            <button className="delete-btn" onClick={onDelete}>
              <DeleteIcon />
              Удалить
            </button>
          )}
        </div>
      </div>

      <div className="bottom_text">
        <p>{content}</p>
      </div>
    </div>
  );
};

export default Review;

import "./review.scss";
import StarIcon from "@mui/icons-material/Star";
import DeleteIcon from "@mui/icons-material/Delete";
import { Link } from "react-router-dom";

const Review = ({ review, onDelete, isCurrentUser }) => {
  const isProfileView = !!review.game;

  const { rating, date, content } = review;

  const displayImage = isProfileView ? review.game.image : review.avatar;
  const displayName = isProfileView ? review.game.title : review.username;
  const linkTarget = isProfileView ? `/games/${review.game.slug}` : null;

  return (
    <div className="review">
      <div className="upper">
        <div className="left_side">
          {isProfileView ? (
            <Link to={linkTarget} className="author game-link">
              <img src={displayImage} alt={displayName} className="game-img" />
              <span>{displayName}</span>
            </Link>
          ) : (
            <div className="author">
              <img src={displayImage} alt="avatar" />
              <span>{displayName}</span>
            </div>
          )}

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

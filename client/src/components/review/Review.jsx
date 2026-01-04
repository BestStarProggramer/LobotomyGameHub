import "./review.scss";
import StarIcon from "@mui/icons-material/Star";

const Review = ({ review }) => {
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
        </div>
      </div>

      <div className="bottom_text">
        <p>{content}</p>
      </div>
    </div>
  );
};

export default Review;

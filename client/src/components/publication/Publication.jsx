import "./publication.scss";
import { Link } from "react-router-dom";
import CommentIcon from "@mui/icons-material/Comment";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FavoriteIcon from "@mui/icons-material/Favorite";

const Publication = ({ publication }) => {
  const {
    id,
    type,
    title,
    author,
    date,
    commentsCount,
    imageUrl,
    views,
    likesCount,
  } = publication;

  return (
    <Link to={`/publications/${id}`} className="publication-link">
      <div className="publication">
        <div className="image-container">
          <img src={imageUrl} alt={title} />
        </div>
        <div className="content">
          <div className="meta-info">
            <div className="type">
              {type === "article" ? "Статья" : "Новость"}
            </div>
            <div className="divider">|</div>
            <div className="author-info">
              <img src={author.avatar} alt={author.username} />
              <span>{author.username}</span>
            </div>
          </div>
          <h3 className="title">{title}</h3>
          <div className="footer">
            <span className="date">{date}</span>
            <div className="stats">
              <div className="stat-item">
                <VisibilityIcon className="icon-small" />
                <span>{views}</span>
              </div>
              <div className="stat-item">
                <FavoriteIcon className="icon-small" />
                <span>{likesCount}</span>
              </div>
              <div className="stat-item">
                <CommentIcon className="icon-small" />
                <span>{commentsCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Publication;

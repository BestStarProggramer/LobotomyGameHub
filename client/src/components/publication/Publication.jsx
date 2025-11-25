import "./publication.scss";
import { Link } from "react-router-dom";
import CommentIcon from "@mui/icons-material/Comment";

const Publication = ({ publication }) => {
  const { id, type, title, author, date, commentsCount, imageUrl } =
    publication;

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
            <div className="comments">
              <CommentIcon className="comment-icon" />
              <span>{commentsCount}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Publication;

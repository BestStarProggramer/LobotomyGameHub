import "./publicationSection.scss";
import CommentIcon from "@mui/icons-material/Comment";
import { Link } from "react-router-dom";

const PublicationSection = ({ publication }) => {
  const { title, author, date, commentsCount, content } = publication;

  return (
    <div className="publication-section">
      <div className="publication-header">
        <div className="meta-stats">
          <span className="date">{date}</span>
          <div className="stat">
            <CommentIcon className="stat-icon" />
            <span>{commentsCount}</span>
          </div>
        </div>

        <h1 className="publication-title">{title}</h1>

        <Link to={`/profile/${author.id}`} className="author-info">
          <img src={author.avatar} alt={author.username} />
          <span>{author.username}</span>
        </Link>
      </div>

      <div className="publication-content">
        <div
          className="content-text"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
};

export default PublicationSection;

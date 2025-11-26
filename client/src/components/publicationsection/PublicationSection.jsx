import "./publicationSection.scss";
import CommentIcon from "@mui/icons-material/Comment";
import VisibilityIcon from "@mui/icons-material/Visibility";

const PublicationSection = ({ publication }) => {
  const { title, author, date, commentsCount, viewsCount, content } =
    publication;

  return (
    <div className="publication-section">
      <div className="publication-header">
        <div className="meta-stats">
          <span className="date">{date}</span>
          <div className="stat">
            <CommentIcon className="stat-icon" />
            <span>{commentsCount}</span>
          </div>
          <div className="stat">
            <VisibilityIcon className="stat-icon" />
            <span>{viewsCount}</span>
          </div>
        </div>

        <h1 className="publication-title">{title}</h1>

        <div className="author-info">
          <img src={author.avatar} alt={author.username} />
          <span>{author.username}</span>
        </div>
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

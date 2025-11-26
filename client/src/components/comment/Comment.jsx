import "./comment.scss";

const Comment = ({ comment }) => {
  const { username, avatar, date, content } = comment;

  return (
    <div className="comment">
      <div className="comment-header">
        <div className="user-info">
          <img src={avatar} alt={username} />
          <span className="username">{username}</span>
        </div>
        <span className="comment-date">{date}</span>
      </div>
      <div className="comment-content">
        <p>{content}</p>
      </div>
    </div>
  );
};

export default Comment;

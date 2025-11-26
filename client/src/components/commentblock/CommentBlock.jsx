import "./commentBlock.scss";
import { useState } from "react";
import CommentIcon from "@mui/icons-material/Comment";
import Comment from "../comment/Comment";

const CommentBlock = ({ comments: initialComments, publicationId }) => {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [isWriting, setIsWriting] = useState(false);

  const formatDate = (date) => {
    return date.toLocaleString("ru-RU", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      username: "CurrentUser",
      avatar: "/img/default-avatar.jpg",
      date: formatDate(new Date()),
      content: newComment,
    };

    setComments([...comments, comment]);
    setNewComment("");
    setIsWriting(false);
  };

  const handleCancel = () => {
    setNewComment("");
    setIsWriting(false);
  };

  return (
    <div className="comment-block">
      <div className="comment-header">
        <CommentIcon className="comment-icon" />
        <h2>Комментарии ({comments.length})</h2>
      </div>

      <form className="comment-form" onSubmit={handleSubmit}>
        <textarea
          value={newComment}
          onChange={(e) => {
            setNewComment(e.target.value);
            if (!isWriting) setIsWriting(true);
          }}
          placeholder="Напишите комментарий..."
          rows="4"
        />
        {isWriting && (
          <div className="comment-actions">
            <button type="submit" className="submit-btn">
              Отправить
            </button>
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Отмена
            </button>
          </div>
        )}
      </form>

      <div className="comments-list">
        {comments.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
};

export default CommentBlock;

import "./comment.scss";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { makeRequest } from "../../axios";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import DeleteIcon from "@mui/icons-material/Delete";
import ReplyIcon from "@mui/icons-material/Reply";
import CommentInput from "../commentinput/CommentInput";

const Comment = ({
  comment,
  publicationId,
  onDelete,
  onReplySuccess,
  depth = 0,
}) => {
  const { currentUser } = useContext(AuthContext);
  const [likesCount, setLikesCount] = useState(comment.likes_count);
  const [isLiked, setIsLiked] = useState(comment.is_liked);
  const [isReplying, setIsReplying] = useState(false);

  const { id, user, created_at, content, children, parent_id } = comment;

  const dateStr = new Date(created_at).toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleLike = async () => {
    if (!currentUser) return;
    setIsLiked(!isLiked);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));

    try {
      await makeRequest.post(`/comments/${id}/like`);
    } catch (err) {
      setIsLiked(!isLiked);
      setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Удалить комментарий?")) return;
    try {
      await makeRequest.delete(`/comments/${id}`);
      onDelete(id);
    } catch (err) {
      alert("Не удалось удалить комментарий");
    }
  };

  const handleReplySubmit = async (data) => {
    try {
      const isMaxDepth = depth >= 2;

      const targetParentId = isMaxDepth ? parent_id : id;

      let finalContent = data.content;
      if (isMaxDepth) {
        finalContent = `@${user.username}, ${finalContent}`;
      }

      const res = await makeRequest.post(`/comments/${publicationId}`, {
        content: finalContent,
        parentId: targetParentId,
      });

      const newComment = {
        ...res.data,
        user: {
          id: currentUser.id,
          username: currentUser.username,
          avatar: currentUser.avatar_url || "/img/default-avatar.jpg",
        },
      };

      setIsReplying(false);
      onReplySuccess(newComment);
    } catch (err) {
      console.error(err);
      alert(
        "Ошибка при ответе: " +
          (err.response?.data?.error || "Неизвестная ошибка")
      );
    }
  };

  const isOwn = currentUser && currentUser.id === user.id;
  const isAdmin = currentUser?.role === "admin";
  const canDelete = isOwn || isAdmin;

  return (
    <div
      className={`comment-wrapper ${depth > 0 ? "is-reply" : ""}`}
      style={{ marginLeft: depth > 0 ? "30px" : "0" }}
    >
      <div className="comment-card">
        <div className="comment-header">
          <Link to={`/profile/${user.id}`} className="author-info">
            <img src={user.avatar} alt={user.username} />
            <span className="username">{user.username}</span>
          </Link>
          <span className="date">{dateStr}</span>
        </div>

        <div className="comment-content">
          <p>{content}</p>
        </div>

        <div className="comment-actions">
          <div className="likes" onClick={handleLike}>
            {isLiked ? (
              <FavoriteIcon className="icon liked" />
            ) : (
              <FavoriteBorderIcon className="icon" />
            )}
            <span>{likesCount}</span>
          </div>

          {currentUser && (
            <button
              className="action-btn reply-btn"
              onClick={() => setIsReplying(!isReplying)}
            >
              <ReplyIcon className="icon" />
              Ответить
            </button>
          )}

          {canDelete && (
            <button className="action-btn delete-btn" onClick={handleDelete}>
              <DeleteIcon className="icon" />
              Удалить
            </button>
          )}
        </div>
      </div>

      {isReplying && (
        <div className="reply-input-container">
          <CommentInput
            onSubmit={handleReplySubmit}
            onCancel={() => setIsReplying(false)}
          />
        </div>
      )}

      {children && children.length > 0 && (
        <div className="comment-children">
          {children.map((child) => (
            <Comment
              key={child.id}
              comment={child}
              publicationId={publicationId}
              onDelete={onDelete}
              onReplySuccess={onReplySuccess}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment;

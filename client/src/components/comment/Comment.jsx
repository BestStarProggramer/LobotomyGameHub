import "./comment.scss";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { makeRequest } from "../../axios";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ReplyIcon from "@mui/icons-material/Reply";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import CommentInput from "../commentinput/CommentInput";

const Comment = ({
  comment,
  publicationId,
  onDelete,
  onReplySuccess,
  depth = 0,
}) => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [likesCount, setLikesCount] = useState(comment.likes_count);
  const [isLiked, setIsLiked] = useState(comment.is_liked);
  const [isReplying, setIsReplying] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [currentContent, setCurrentContent] = useState(comment.content);
  const [isEdited, setIsEdited] = useState(comment.is_edited);
  const [updatedAt, setUpdatedAt] = useState(comment.updated_at);

  const { id, user, created_at, children, parent_id } = comment;

  const dateStr = new Date(created_at).toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const getEditedDate = () => {
    if (!updatedAt) return null;
    return new Date(updatedAt).toLocaleString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleLike = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    const prevLiked = isLiked;
    const prevCount = likesCount;

    setIsLiked(!isLiked);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));

    try {
      const res = await makeRequest.post(`/comments/${id}/like`);
      setLikesCount(res.data.likesCount);
      setIsLiked(res.data.isLiked);
    } catch (err) {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      console.error(err);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;

    try {
      const res = await makeRequest.put(`/comments/${id}`, {
        content: editContent,
      });
      setCurrentContent(editContent);
      setIsEdited(res.data.is_edited);
      setUpdatedAt(res.data.updated_at);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Не удалось сохранить изменения");
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

  const canEdit = isOwn;
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
          <div className="date-block">
            <span className="date">{dateStr}</span>
            {isEdited && (
              <span className="edited-label">
                (Изменено: {getEditedDate()})
              </span>
            )}
          </div>
        </div>

        <div className="comment-content">
          {isEditing ? (
            <div className="edit-area">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
              />
              <div className="edit-controls">
                <button className="save-btn" onClick={handleEdit}>
                  <CheckIcon />
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(currentContent);
                  }}
                >
                  <CloseIcon />
                </button>
              </div>
            </div>
          ) : (
            <p>{currentContent}</p>
          )}
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

          {!isEditing && currentUser && (
            <button
              className="action-btn reply-btn"
              onClick={() => setIsReplying(!isReplying)}
            >
              <ReplyIcon className="icon" />
              Ответить
            </button>
          )}

          <div className="manage-actions">
            {canEdit && !isEditing && (
              <button
                className="action-btn edit-btn"
                onClick={() => setIsEditing(true)}
              >
                <EditIcon className="icon" />
              </button>
            )}
            {canDelete && !isEditing && (
              <button className="action-btn delete-btn" onClick={handleDelete}>
                <DeleteIcon className="icon" />
              </button>
            )}
          </div>
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

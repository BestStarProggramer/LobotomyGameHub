import "./review.scss";
import StarIcon from "@mui/icons-material/Star";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { Link } from "react-router-dom";
import { useState, useContext } from "react";
import { AuthContext } from "../../context/authContext";
import { makeRequest } from "../../axios";
import { getRoleConfig } from "../../utils/roles";

const Review = ({ review, onDelete, hideDelete = false }) => {
  const { currentUser } = useContext(AuthContext);
  const isProfileView = !!review.game;

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(review.content);
  const [currentContent, setCurrentContent] = useState(review.content);
  const [currentRating, setCurrentRating] = useState(review.rating);
  const [editRating, setEditRating] = useState(review.rating);

  const [isEdited, setIsEdited] = useState(review.is_edited);
  const [updatedAt, setUpdatedAt] = useState(review.updated_at);

  const { date, user_id } = review;

  const displayImage = isProfileView ? review.game.image : review.avatar;
  const displayName = isProfileView ? review.game.title : review.username;
  const linkTarget = isProfileView
    ? `/games/${review.game.slug}`
    : `/profile/${user_id}`;

  const isOwn = currentUser && String(currentUser.id) === String(user_id);
  const isAdmin = currentUser?.role === "admin";

  const canEdit = isOwn;
  const canDelete = isOwn || isAdmin;
  const roleConfig = getRoleConfig(review.role || "user");

  const authorClass = !isProfileView
    ? `author ${roleConfig.className} ${
        roleConfig.className ? "role-border" : ""
      }`
    : "author game-link";

  const getEditedDate = () => {
    if (!updatedAt) return null;
    return new Date(updatedAt).toLocaleDateString("ru-RU");
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;

    try {
      const res = await makeRequest.put(`/reviews/${review.id}`, {
        content: editContent,
        rating: editRating,
      });

      setCurrentContent(editContent);
      setCurrentRating(editRating);
      setIsEdited(res.data.is_edited);
      setUpdatedAt(res.data.updated_at);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Не удалось сохранить отзыв");
    }
  };

  return (
    <div className="review">
      <div className="upper">
        <div className="left_side">
          <Link to={linkTarget} className={authorClass}>
            <img
              src={displayImage}
              alt={displayName}
              className={isProfileView ? "game-img" : ""}
            />
            <span>{displayName}</span>

            {!isProfileView && roleConfig.label && (
              <span className="role-badge">{roleConfig.label}</span>
            )}
          </Link>

          <div className="rating">
            {isEditing ? (
              <div className="rating-edit">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    className={`star ${star <= editRating ? "active" : ""}`}
                    onClick={() => setEditRating(star)}
                  />
                ))}
              </div>
            ) : (
              <div className="value">
                <span>{currentRating}</span>
                <StarIcon className="star" />
              </div>
            )}
          </div>
        </div>

        <div className="date-section">
          <div className="date-info">
            <p>{date}</p>
            {isEdited && (
              <span className="edited-tag">(Изменено: {getEditedDate()})</span>
            )}
          </div>

          <div className="actions">
            {canEdit && !isEditing && (
              <button
                className="icon-btn edit-btn"
                onClick={() => setIsEditing(true)}
              >
                <EditIcon />
              </button>
            )}
            {!hideDelete && canDelete && !isEditing && onDelete && (
              <button
                className="icon-btn delete-btn"
                onClick={() => onDelete(review.id)}
              >
                <DeleteIcon />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bottom_text">
        {isEditing ? (
          <div className="edit-area">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={4}
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
                  setEditRating(currentRating);
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
    </div>
  );
};

export default Review;

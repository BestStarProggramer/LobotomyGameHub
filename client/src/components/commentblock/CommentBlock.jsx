import "./commentBlock.scss";
import { useState, useContext, useRef, useEffect } from "react";
import CommentIcon from "@mui/icons-material/Comment";
import Comment from "../comment/Comment";
import CommentInput from "../commentinput/CommentInput";
import { AuthContext } from "../../context/authContext";

const CommentBlock = ({ comments: initialComments, publicationId }) => {
  const [comments, setComments] = useState(initialComments);
  const { currentUser } = useContext(AuthContext);

  const currentUserRef = useRef(currentUser);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const formatDate = (date) => {
    return date.toLocaleString("ru-RU", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCommentSubmit = (commentData) => {
    const user = currentUserRef.current;

    if (!user) {
      console.error("Пользователь не авторизован");
      return;
    }

    const comment = {
      id: Date.now(),
      username: user.username,
      avatar: user.avatar_url || "/img/default-avatar.jpg",
      date: formatDate(new Date()),
      content: commentData.content,
    };

    setComments([...comments, comment]);
  };

  const handleCommentCancel = () => {
    // Логика отмены
  };

  return (
    <div className="comment-block">
      <div className="comment-header">
        <CommentIcon className="comment-icon" />
        <h2>Комментарии ({comments.length})</h2>
      </div>

      {currentUser && (
        <CommentInput
          onSubmit={handleCommentSubmit}
          onCancel={handleCommentCancel}
        />
      )}

      <div className="comments-list">
        {comments.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
};

export default CommentBlock;

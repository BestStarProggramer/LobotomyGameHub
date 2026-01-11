import "./commentBlock.scss";
import { useState, useContext, useEffect, useMemo } from "react";
import CommentIcon from "@mui/icons-material/Comment";
import Comment from "../comment/Comment";
import CommentInput from "../commentinput/CommentInput";
import { AuthContext } from "../../context/authContext";
import { makeRequest } from "../../axios";

const CommentBlock = ({ publicationId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await makeRequest.get(`/comments/${publicationId}`);
        setComments(res.data);
      } catch (err) {
        console.error("Failed to fetch comments", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [publicationId]);

  const handleCommentSubmit = async (commentData) => {
    try {
      const res = await makeRequest.post(`/comments/${publicationId}`, {
        content: commentData.content,
      });

      const newComment = {
        ...res.data,
        user: {
          id: currentUser.id,
          username: currentUser.username,
          avatar: currentUser.avatar_url || "/img/default-avatar.jpg",
        },
      };

      setComments((prev) => [...prev, newComment]);
    } catch (err) {
      console.error("Failed to post comment", err);
      alert(err.response?.data?.error || "Ошибка при отправке комментария");
    }
  };

  const handleDeleteComment = (commentId) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const commentTree = useMemo(() => {
    const map = {};
    const roots = [];

    comments.forEach((c) => {
      map[c.id] = { ...c, children: [] };
    });

    comments.forEach((c) => {
      if (c.parent_id && map[c.parent_id]) {
        map[c.parent_id].children.push(map[c.id]);
      } else {
        roots.push(map[c.id]);
      }
    });

    roots.sort((a, b) => b.likes_count - a.likes_count);

    const sortChildren = (node) => {
      if (node.children.length > 0) {
        node.children.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
        node.children.forEach(sortChildren);
      }
    };

    roots.forEach(sortChildren);

    return roots;
  }, [comments]);

  if (loading)
    return <div className="comment-block">Загрузка комментариев...</div>;

  return (
    <div className="comment-block">
      <div className="comment-header">
        <CommentIcon className="comment-icon" />
        <h2>Комментарии ({comments.length})</h2>
      </div>

      {currentUser ? (
        <CommentInput onSubmit={handleCommentSubmit} />
      ) : (
        <div className="guest-message">
          <p>Войдите, чтобы оставить комментарий</p>
        </div>
      )}

      <div className="comments-list">
        {commentTree.map((node) => (
          <Comment
            key={node.id}
            comment={node}
            publicationId={publicationId}
            onDelete={handleDeleteComment}
            depth={0}
            onReplySuccess={(newComment) =>
              setComments((prev) => [...prev, newComment])
            }
          />
        ))}
      </div>
    </div>
  );
};

export default CommentBlock;

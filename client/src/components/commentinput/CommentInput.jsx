import "./commentInput.scss";
import { useState } from "react";

const CommentInput = ({ onSubmit, onCancel }) => {
  const [content, setContent] = useState("");
  const [isWriting, setIsWriting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    onSubmit({
      content: content.trim(),
    });

    setContent("");
    setIsWriting(false);
  };

  const handleCancel = () => {
    setContent("");
    setIsWriting(false);
    onCancel?.();
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    if (!isWriting) setIsWriting(true);
  };

  return (
    <div className="comment-input">
      <form className="comment-form" onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder="Напишите комментарий..."
          rows="4"
        />

        {isWriting && (
          <div className="comment-actions">
            <button
              type="submit"
              className="submit-btn"
              disabled={!content.trim()}
            >
              Отправить
            </button>
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Отмена
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default CommentInput;

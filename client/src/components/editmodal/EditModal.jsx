import "./editModal.scss";
import { useState } from "react";

const EditModal = ({
  title,
  initialValue,
  onSave,
  onClose,
  isTextarea = false,
  maxLength = 500,
}) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!value.trim()) {
      setError("Поле не может быть пустым");
      return;
    }

    if (value.trim() === initialValue) {
      setError("Значение не изменилось");
      return;
    }

    onSave(value.trim());
  };

  const handleChange = (e) => {
    setValue(e.target.value);
    setError("");
  };

  return (
    <div className="edit-modal" onClick={onClose}>
      <div className="edit-modal__content" onClick={(e) => e.stopPropagation()}>
        <h2 className="edit-modal__title">{title}</h2>

        {isTextarea ? (
          <textarea
            className="edit-modal__textarea"
            value={value}
            onChange={handleChange}
            maxLength={maxLength}
            rows="6"
          />
        ) : (
          <input
            type="text"
            className="edit-modal__input"
            value={value}
            onChange={handleChange}
            maxLength={maxLength}
          />
        )}

        <div className="edit-modal__char-count">
          {value.length} / {maxLength}
        </div>

        {error && <div className="edit-modal__error">{error}</div>}

        <div className="edit-modal__actions">
          <button
            className="edit-modal__button edit-modal__button--save"
            onClick={handleSave}
          >
            Сохранить
          </button>
          <button
            className="edit-modal__button edit-modal__button--cancel"
            onClick={onClose}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;

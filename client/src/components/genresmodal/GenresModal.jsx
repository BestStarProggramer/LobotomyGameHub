import "./genresModal.scss";
import { useState } from "react";

const GenresModal = ({ selectedGenres, onSave, onClose }) => {
  const availableGenres = [
    "Action",
    "Indie",
    "Adventure",
    "RPG",
    "Strategy",
    "Shooter",
    "Casual",
    "Simulation",
    "Puzzle",
    "Arcade",
    "Platformer",
    "Massively Multiplayer",
    "Racing",
    "Sports",
    "Fighting",
    "Family",
    "Board Games",
    "Card",
    "Educational",
  ];

  const [selected, setSelected] = useState([...selectedGenres]);
  const [error, setError] = useState("");

  const toggleGenre = (genre) => {
    setError("");
    if (selected.includes(genre)) {
      setSelected(selected.filter((g) => g !== genre));
    } else {
      if (selected.length >= 10) {
        setError("Можно выбрать максимум 10 жанров");
        return;
      }
      setSelected([...selected, genre]);
    }
  };

  const handleSave = () => {
    if (selected.length === 0) {
      setError("Выберите хотя бы один жанр");
      return;
    }

    onSave(selected);
  };

  return (
    <div className="genres-modal" onClick={onClose}>
      <div
        className="genres-modal__content"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="genres-modal__title">Выберите любимые жанры</h2>
        <p className="genres-modal__subtitle">
          Выбрано: {selected.length} / 10
        </p>

        <div className="genres-modal__grid">
          {availableGenres.map((genre) => (
            <button
              key={genre}
              className={`genres-modal__genre ${
                selected.includes(genre) ? "genres-modal__genre--selected" : ""
              }`}
              onClick={() => toggleGenre(genre)}
            >
              {genre}
            </button>
          ))}
        </div>

        {error && <div className="genres-modal__error">{error}</div>}

        <div className="genres-modal__actions">
          <button
            className="genres-modal__button genres-modal__button--save"
            onClick={handleSave}
          >
            Сохранить
          </button>
          <button
            className="genres-modal__button genres-modal__button--cancel"
            onClick={onClose}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenresModal;

import "./genresModal.scss";
import { useState, useEffect } from "react";
import axios from "axios";

const GenresModal = ({ selectedGenres, onSave, onClose }) => {
  const [availableGenres, setAvailableGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [selected, setSelected] = useState([...selectedGenres]);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await axios.get("http://localhost:8800/api/data/genres");

        if (Array.isArray(res.data)) {
          setAvailableGenres(res.data);
          setFetchError(null);
        } else {
          setFetchError("Неверный формат данных жанров от сервера.");
        }
      } catch (err) {
        console.error("Ошибка загрузки доступных жанров:", err);
        setFetchError(
          "Не удалось загрузить список жанров из базы данных. Проверьте: 1. Запущен ли бэкенд; 2. Запустился ли loadGenres.js."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchGenres();
  }, []);

  const toggleGenre = (genre) => {
    setSaveError("");
    if (selected.includes(genre)) {
      setSelected(selected.filter((g) => g !== genre));
    } else {
      if (selected.length >= 10) {
        setSaveError("Можно выбрать максимум 10 жанров");
        return;
      }
      setSelected([...selected, genre]);
    }
  };

  const handleSave = () => {
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

        {isLoading && (
          <div className="genres-modal__loading">
            Загрузка жанров из базы данных...
          </div>
        )}

        {fetchError && (
          <div className="genres-modal__error genres-modal__error--fatal">
            {fetchError}
          </div>
        )}

        {!isLoading && !fetchError && (
          <div className="genres-modal__grid">
            {availableGenres.length === 0 ? (
              <p className="genres-modal__loading">
                В базе данных нет доступных жанров. Запустите loadGenres.js.
              </p>
            ) : (
              availableGenres.map((genre) => (
                <button
                  key={genre}
                  className={`genres-modal__genre ${
                    selected.includes(genre)
                      ? "genres-modal__genre--selected"
                      : ""
                  }`}
                  onClick={() => toggleGenre(genre)}
                >
                  {genre}
                </button>
              ))
            )}
          </div>
        )}

        {saveError && <div className="genres-modal__error">{saveError}</div>}

        <div className="genres-modal__actions">
          <button
            className="genres-modal__button genres-modal__button--save"
            onClick={handleSave}
            disabled={isLoading || fetchError || availableGenres.length === 0}
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

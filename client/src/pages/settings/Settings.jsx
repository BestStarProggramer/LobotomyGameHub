import "./settings.scss";
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/authContext";
import EditModal from "../../components/editmodal/EditModal";
import GenresModal from "../../components/genresmodal/GenresModal";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Settings = () => {
  const { currentUser, updateCurrentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [userData, setUserData] = useState({
    username: currentUser?.username || "Гость",
    bio: currentUser?.bio || "Расскажите о себе...",
    avatar: currentUser?.avatar_url || "/img/default-avatar.jpg",
    favoriteGenres: currentUser?.favoriteGenres || [],
  });

  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [isGenresModalOpen, setIsGenresModalOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    const fetchCurrentProfile = async () => {
      try {
        const res = await axios.get("http://localhost:8800/api/auth/profile", {
          withCredentials: true,
        });
        const data = res.data;

        setUserData((prev) => ({
          ...prev,
          avatar: data.avatar_url || prev.avatar,
          bio: data.bio || prev.bio,
          favoriteGenres: Array.isArray(data.favoriteGenres)
            ? data.favoriteGenres
            : [],
        }));
      } catch (err) {
        console.error(
          "Ошибка загрузки профиля:",
          err.response?.data || err.message
        );
      }
    };
    fetchCurrentProfile();
  }, [currentUser, navigate]);

  const handleUpdateProfile = async (field, value) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    let payload = {};
    let url = "http://localhost:8800/api/auth/profile";

    if (field === "favoriteGenres") {
      payload.favoriteGenres = value;
      url = "http://localhost:8800/api/auth/profile/genres";
    } else if (field === "avatar") {
      payload.avatar_url = value;
    } else {
      payload[field] = value;
    }

    try {
      const res = await axios.put(url, payload, { withCredentials: true });

      setUserData((prev) => ({ ...prev, [field]: value }));

      if (field === "username" && updateCurrentUser) {
        updateCurrentUser({ ...currentUser, username: value });
      }

      setSuccess(res.data || "Настройка успешно обновлена!");
    } catch (err) {
      console.error("Ошибка обновления:", err.response?.data || err.message);

      if (err.response?.status === 400 && field === "favoriteGenres") {
        setError(
          err.response.data ||
            "Ошибка: Один или несколько жанров не найдены в БД."
        );
      } else {
        setError(err.response?.data || "Ошибка сервера при обновлении.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUsername = (newValue) => {
    if (newValue.trim() && newValue !== userData.username) {
      handleUpdateProfile("username", newValue.trim());
    }
    setIsUsernameModalOpen(false);
  };

  const handleSaveBio = (newValue) => {
    if (newValue !== userData.bio) {
      handleUpdateProfile("bio", newValue);
    }
    setIsBioModalOpen(false);
  };

  const handleSaveGenres = (newGenres) => {
    handleUpdateProfile("favoriteGenres", newGenres);
    setIsGenresModalOpen(false);
  };

  const renderGenreTags = () => {
    if (userData.favoriteGenres.length === 0) {
      return <div className="settings__field-value">Нет выбранных жанров</div>;
    }
    return (
      <div className="settings__genres">
        {userData.favoriteGenres.map((genre) => (
          <span key={genre} className="settings__genre-tag">
            {genre}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="settings">
      <div className="settings__container">
        <h1 className="settings__title">Настройки профиля</h1>

        {loading && (
          <div className="settings__message settings__message--loading">
            Сохранение изменений...
          </div>
        )}
        {error && (
          <div className="settings__message settings__message--error">
            Ошибка: {error}
          </div>
        )}
        {success && (
          <div className="settings__message settings__message--success">
            Успех: {success}
          </div>
        )}

        <div className="settings__content">
          <div className="settings__avatar-block">
            <img
              src={userData.avatar}
              alt="Аватар"
              className="settings__avatar"
            />
            <button
              className="settings__button settings__button--secondary"
              disabled={loading}
            >
              Сменить аватар
            </button>
          </div>

          <div className="settings__section">
            <h2 className="settings__section-title">Основные данные</h2>

            <div className="settings__field">
              <span className="settings__field-label">Никнейм</span>
              <span className="settings__field-value">{userData.username}</span>
              <button
                className="settings__button settings__button--primary"
                onClick={() => setIsUsernameModalOpen(true)}
                disabled={loading}
              >
                Изменить
              </button>
            </div>

            <div className="settings__field">
              <span className="settings__field-label">О себе (Bio)</span>
              <span className="settings__field-value settings__field-value--bio">
                {userData.bio}
              </span>
              <button
                className="settings__button settings__button--primary"
                onClick={() => setIsBioModalOpen(true)}
                disabled={loading}
              >
                Изменить
              </button>
            </div>

            <div className="settings__field">
              <span className="settings__field-label">Любимые жанры</span>
              {renderGenreTags()}
              <button
                className="settings__button settings__button--primary"
                onClick={() => setIsGenresModalOpen(true)}
                disabled={loading}
              >
                Изменить
              </button>
            </div>
          </div>

          <div className="settings__section">
            <h2 className="settings__section-title">Безопасность</h2>
            <div className="settings__security">
              <button
                className="settings__button settings__button--danger"
                onClick={() => navigate("/reset-password")}
                disabled={loading}
              >
                Сменить пароль
              </button>
              <button
                className="settings__button settings__button--danger"
                onClick={() => navigate("/reset-email")}
                disabled={loading}
              >
                Сменить email
              </button>
            </div>
          </div>
        </div>
      </div>

      {isUsernameModalOpen && (
        <EditModal
          title="Изменить никнейм"
          initialValue={userData.username}
          onSave={handleSaveUsername}
          onClose={() => setIsUsernameModalOpen(false)}
          maxLength={50}
        />
      )}

      {isBioModalOpen && (
        <EditModal
          title="Изменить описание"
          initialValue={userData.bio || ""}
          onSave={handleSaveBio}
          onClose={() => setIsBioModalOpen(false)}
          isTextarea={true}
          maxLength={500}
        />
      )}

      {isGenresModalOpen && (
        <GenresModal
          selectedGenres={userData.favoriteGenres}
          onSave={handleSaveGenres}
          onClose={() => setIsGenresModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Settings;

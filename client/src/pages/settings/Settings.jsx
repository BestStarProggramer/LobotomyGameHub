import "./settings.scss";
import { useState, useContext } from "react";
import { AuthContext } from "../../context/authContext";
import EditModal from "../../components/editmodal/EditModal";
import GenresModal from "../../components/genresmodal/GenresModal";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    username: currentUser?.username || "Гость",
    bio: currentUser?.bio || "Расскажите о себе...",
    avatar: currentUser?.avatar_url || "/img/default-avatar.jpg",
    favoriteGenres: currentUser?.favoriteGenres || [
      "RPG",
      "Action",
      "Adventure",
    ],
  });

  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [isGenresModalOpen, setIsGenresModalOpen] = useState(false);

  const handleSaveUsername = (newValue) => {
    setUserData((prev) => ({ ...prev, username: newValue }));
    setIsUsernameModalOpen(false);
    // TODO: отправка на сервер
    console.log("Новое имя:", newValue);
  };

  const handleSaveBio = (newValue) => {
    setUserData((prev) => ({ ...prev, bio: newValue }));
    setIsBioModalOpen(false);
    // TODO: отправка на сервер
    console.log("Новое описание:", newValue);
  };

  const handleSaveGenres = (newGenres) => {
    setUserData((prev) => ({ ...prev, favoriteGenres: newGenres }));
    setIsGenresModalOpen(false);
    // TODO: отправка на сервер
    console.log("Новые жанры:", newGenres);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUserData((prev) => ({ ...prev, avatar: event.target.result }));
        // TODO: отправка на сервер
        console.log("Новый аватар загружен");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="settings">
      <div className="settings__container">
        <h1 className="settings__title">Настройки профиля</h1>

        <div className="settings__content">
          <div className="settings__section">
            <h2 className="settings__section-title">Аватар</h2>
            <div className="settings__avatar-block">
              <img
                src={userData.avatar}
                alt="Аватар"
                className="settings__avatar"
              />
              <div className="settings__avatar-actions">
                <label className="settings__button settings__button--primary">
                  Загрузить новый аватар
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="settings__section">
            <h2 className="settings__section-title">Никнейм</h2>
            <div className="settings__field">
              <div className="settings__field-value">{userData.username}</div>
              <button
                className="settings__button settings__button--secondary"
                onClick={() => setIsUsernameModalOpen(true)}
              >
                Изменить
              </button>
            </div>
          </div>

          <div className="settings__section">
            <h2 className="settings__section-title">Описание профиля</h2>
            <div className="settings__field">
              <div className="settings__field-value settings__field-value--bio">
                {userData.bio}
              </div>
              <button
                className="settings__button settings__button--secondary"
                onClick={() => setIsBioModalOpen(true)}
              >
                Изменить
              </button>
            </div>
          </div>

          <div className="settings__section">
            <h2 className="settings__section-title">Любимые жанры</h2>
            <div className="settings__genres">
              {userData.favoriteGenres.map((genre, index) => (
                <span key={index} className="settings__genre-tag">
                  {genre}
                </span>
              ))}
            </div>
            <button
              className="settings__button settings__button--secondary"
              onClick={() => setIsGenresModalOpen(true)}
            >
              Изменить жанры
            </button>
          </div>

          <div className="settings__section">
            <h2 className="settings__section-title">Безопасность</h2>
            <div className="settings__security">
              <button
                className="settings__button settings__button--danger"
                onClick={() => navigate("/reset-password")}
              >
                Сменить пароль
              </button>
              <button
                className="settings__button settings__button--danger"
                onClick={() => navigate("/reset-email")}
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
          initialValue={userData.bio}
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

import "./settings.scss";
import { useState, useContext, useEffect, useRef } from "react";
import { AuthContext } from "../../context/authContext";
import EditModal from "../../components/editmodal/EditModal";
import GenresModal from "../../components/genresmodal/GenresModal";
import { useNavigate } from "react-router-dom";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import axios from "axios";

const Settings = () => {
  const { currentUser, updateCurrentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [userData, setUserData] = useState({
    username: currentUser?.username || "Гость",
    bio: currentUser?.bio || "",
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

      if (updateCurrentUser) {
        const updatedUser = { ...currentUser };

        if (field === "username") {
          updatedUser.username = value;
        } else if (field === "avatar") {
          updatedUser.avatar_url = value;
        } else if (field === "bio") {
          updatedUser.bio = value;
        }

        updateCurrentUser(updatedUser);
      }

      if (res.data && typeof res.data === "object" && res.data.error) {
        setError(res.data.error);
      } else if (res.data && typeof res.data === "object" && res.data.message) {
        setSuccess(res.data.message);
      } else if (typeof res.data === "string") {
        setSuccess(res.data);
      } else {
        setSuccess("Настройка успешно обновлена!");
      }

      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (field === "avatar" && storedUser) {
        storedUser.avatar_url = value;
        localStorage.setItem("user", JSON.stringify(storedUser));
      }
    } catch (err) {
      console.error("Ошибка обновления:", err?.response?.data || err?.message);
      const resp = err?.response?.data;
      const errorMsg =
        (resp && typeof resp === "object" && (resp.error || resp.message)) ||
        (typeof resp === "string" && resp) ||
        err?.message ||
        "Ошибка сервера при обновлении.";
      setError(errorMsg);
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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Пожалуйста, выберите изображение");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Размер файла не должен превышать 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      handleUpdateProfile("avatar", base64String);
    };
    reader.onerror = () => {
      setError("Ошибка при чтении файла");
    };
    reader.readAsDataURL(file);
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

        {currentUser &&
          (currentUser.role === "admin" ||
            currentUser?.role === "moderator") && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <button
                className="settings__button settings__button--primary"
                onClick={() => navigate("/admin")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  background: "#e67e22",
                }}
              >
                <AdminPanelSettingsIcon /> Админ панель
              </button>
            </div>
          )}

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
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: "none" }}
            />
            <button
              className="settings__button settings__button--secondary"
              onClick={handleAvatarClick}
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

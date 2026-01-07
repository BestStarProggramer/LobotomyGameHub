import { useRef, useState, useEffect, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Editor from "../../components/editor/Editor.jsx";
import { AuthContext } from "../../context/authContext";
import "./publications_edit.scss";

function PublicationsEdit() {
  const editorRef = useRef(null);
  const { publicationId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("news");
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [game, setGame] = useState("");
  const [gameId, setGameId] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState("");

  const [gameSearch, setGameSearch] = useState("");
  const [gameOptions, setGameOptions] = useState([]);
  const [showGameDropdown, setShowGameDropdown] = useState(false);
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  const gameSearchTimeout = useRef(null);

  useEffect(() => {
    const fetchPublication = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8800/api/publications/${publicationId}`,
          {
            withCredentials: true,
          }
        );

        const data = res.data;
        setTitle(data.title);
        setActiveTab(data.type);
        setGameId(data.gameId || "");
        setGame(data.gameTitle || "");
        setGameSearch(data.gameTitle || "");

        if (data.imageUrl) {
          setImagePreview(data.imageUrl);
        }

        if (editorRef.current) {
          editorRef.current.root.innerHTML = data.content;
        }
      } catch (err) {
        console.error("Ошибка при загрузке публикации:", err);
        setErr("Не удалось загрузить публикацию для редактирования");
      } finally {
        setLoading(false);
      }
    };

    fetchPublication();
  }, [publicationId]);

  const searchGames = useCallback(async (query) => {
    if (!query.trim()) {
      setGameOptions([]);
      return;
    }

    setIsLoadingGames(true);
    try {
      const res = await axios.get("http://localhost:8800/api/games/search", {
        params: { q: query },
        withCredentials: true,
      });
      setGameOptions(res.data.slice(0, 5));
    } catch (err) {
      console.error("Ошибка при поиске игр:", err);
      setGameOptions([]);
    } finally {
      setIsLoadingGames(false);
    }
  }, []);

  const handleGameSearchChange = (value) => {
    setGameSearch(value);
    setGame(value);
    setGameId("");

    setShowGameDropdown(!!value.trim());

    if (gameSearchTimeout.current) {
      clearTimeout(gameSearchTimeout.current);
    }

    gameSearchTimeout.current = setTimeout(() => {
      searchGames(value);
    }, 300);
  };

  const handleGameSelect = (selectedGame) => {
    setGame(selectedGame.title);
    setGameId(selectedGame.id);
    setGameSearch(selectedGame.title);
    setShowGameDropdown(false);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleCustomButtonClick = () => {
    fileInputRef.current.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".game-choice-container")) {
        setShowGameDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setErr(null);

    const contentHtml = editorRef.current.root.innerHTML;

    if (!title.trim()) {
      setErr("Название публикации обязательно");
      return;
    }
    if (
      !contentHtml ||
      contentHtml === "<p><br></p>" ||
      contentHtml.trim() === ""
    ) {
      setErr("Содержание публикации не может быть пустым");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", contentHtml);
    formData.append("type", activeTab);

    if (gameId) {
      formData.append("game_id", gameId);
    } else if (game.trim()) {
      formData.append("game", game.trim());
    }

    if (file) {
      formData.append("file", file);
    }

    try {
      await axios.put(
        `http://localhost:8800/api/publications/${publicationId}`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      navigate(`/publications/${publicationId}`);
    } catch (err) {
      console.error("Ошибка при обновлении публикации:", err);
      setErr(
        err.response?.data?.error ||
          "Что-то пошло не так при обновлении публикации."
      );
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="loading">Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="info">
          <h1>Редактирование Публикации</h1>
          <div className="options">
            <div className="type">
              <p>Тип публикации</p>
              <div className="tabs">
                <button
                  className={`tab ${activeTab === "news" ? "active" : ""}`}
                  onClick={() => setActiveTab("news")}
                >
                  Новость
                </button>
                <button
                  className={`tab ${activeTab === "article" ? "active" : ""}`}
                  onClick={() => setActiveTab("article")}
                >
                  Статья
                </button>
              </div>
            </div>
            <div className="title">
              <p>Название</p>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="game-choice-container wide">
              <div className="gamechoice">
                <p>По игре</p>
                <div className="game-search-wrapper">
                  <input
                    type="text"
                    value={gameSearch}
                    onChange={(e) => handleGameSearchChange(e.target.value)}
                    onFocus={() => setShowGameDropdown(true)}
                  />
                  {isLoadingGames && (
                    <div className="game-search-loading">Загрузка...</div>
                  )}

                  {showGameDropdown && gameOptions.length > 0 && (
                    <div className="game-dropdown">
                      {gameOptions.map((gameOption) => (
                        <div
                          key={gameOption.id}
                          className="game-dropdown-item"
                          onClick={() => handleGameSelect(gameOption)}
                        >
                          <div className="game-dropdown-image">
                            <img
                              src={
                                gameOption.background_image ||
                                "/img/default.jpg"
                              }
                              alt={gameOption.title}
                            />
                          </div>
                          <div className="game-dropdown-info">
                            <span className="game-dropdown-title">
                              {gameOption.title}
                            </span>
                            {gameOption.rating > 0 && (
                              <span className="game-dropdown-rating">
                                ★ {gameOption.rating}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {showGameDropdown &&
                    gameOptions.length === 0 &&
                    gameSearch.trim() &&
                    !isLoadingGames && (
                      <div className="game-dropdown">
                        <div className="game-dropdown-no-results">
                          Игры не найдены
                        </div>
                      </div>
                    )}
                </div>
                {gameId && (
                  <div className="selected-game-info">
                    <span>
                      Выбрана игра: <strong>{game}</strong> (ID: {gameId})
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="load-img wide">
              <p>Картинка публикации</p>
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Предпросмотр" />
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: "none" }}
              />

              <button
                type="button"
                className="custom-file-button"
                onClick={handleCustomButtonClick}
              >
                {file ? `Выбрано: ${file.name}` : "Изменить картинку"}
              </button>

              {file && (
                <button
                  type="button"
                  className="remove-file-button"
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                >
                  Отмена
                </button>
              )}

              {file && (
                <div className="file-info">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">
                    ({formatFileSize(file.size)})
                  </span>
                </div>
              )}

              <p className="hint">
                Не нажимайте, чтобы оставить прежнюю картинку
              </p>
            </div>
          </div>
          {err && (
            <div className="error-message">
              {typeof err === "string"
                ? err
                : err.error || "Ошибка при заполнении формы"}
            </div>
          )}
        </div>
        <div className="editor">
          <Editor ref={editorRef} />
          <div className="button-wrapper">
            <button onClick={handleSave} className="save-button">
              Сохранить изменения
            </button>
            <button
              onClick={() => navigate(`/publications/${publicationId}`)}
              className="cancel-button"
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublicationsEdit;

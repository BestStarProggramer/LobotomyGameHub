import { useRef, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Editor from "../../components/editor/Editor.jsx";
import { AuthContext } from "../../context/authContext";
import "./publications_create.scss";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import Alert from "@mui/material/Alert";

function PublicationsWrite() {
  const editorRef = useRef(null);
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [activeTab, setActiveTab] = useState("news");
  const [limitError, setLimitError] = useState("");
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [isGameRelated, setIsGameRelated] = useState(false);
  const [gameSearch, setGameSearch] = useState("");
  const [gameOptions, setGameOptions] = useState([]);

  const [selectedGames, setSelectedGames] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (
      !currentUser ||
      (currentUser.role !== "staff" && currentUser.role !== "admin")
    ) {
      navigate("/publications");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (gameSearch.length > 1) {
        try {
          const res = await axios.get(
            `http://localhost:8800/api/games/search?q=${gameSearch}`,
            { withCredentials: true }
          );
          setGameOptions(res.data);
          setShowDropdown(true);
        } catch (err) {
          console.error(err);
        }
      } else {
        setGameOptions([]);
        setShowDropdown(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [gameSearch]);

  const addGame = (game) => {
    if (selectedGames.length >= 4) {
      setLimitError("Достигнут лимит: нельзя выбрать более 4 игр.");

      setTimeout(() => setLimitError(""), 3000);
      return;
    }

    if (!selectedGames.find((g) => g.id === game.id)) {
      setSelectedGames([...selectedGames, game]);
      setLimitError("");
    }
    setGameSearch("");
    setShowDropdown(false);
  };

  const removeGame = (gameId) => {
    setSelectedGames(selectedGames.filter((g) => g.id !== gameId));
    setLimitError("");
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setImagePreview(URL.createObjectURL(selected));
    }
  };

  const handleSave = async () => {
    const contentHtml = editorRef.current.root.innerHTML;

    if (!title.trim()) return alert("Введите название");
    if (!contentHtml || contentHtml === "<p><br></p>")
      return alert("Введите текст");

    if (isGameRelated && selectedGames.length === 0)
      return alert("Вы отметили 'По игре', но не выбрали ни одной игры");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", contentHtml);
    formData.append("type", activeTab);

    if (isGameRelated) {
      selectedGames.forEach((g) => {
        formData.append("game_ids", g.id);
      });
    }

    if (file) {
      formData.append("file", file);
    }

    try {
      await axios.post("http://localhost:8800/api/publications", formData, {
        withCredentials: true,
      });
      navigate("/publications");
    } catch (err) {
      alert(
        "Ошибка при сохранении: " + (err.response?.data?.error || err.message)
      );
    }
  };

  return (
    <div className="page">
      <div className="container editor-layout">
        <h1>Создание публикации</h1>

        <div className="top-section">
          <div className="left-col">
            <div className="form-group">
              <label>Название</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Заголовок..."
              />
            </div>

            <div className="form-group">
              <label>Тип</label>
              <div className="type-switch">
                <button
                  className={activeTab === "news" ? "active" : ""}
                  onClick={() => setActiveTab("news")}
                >
                  Новость
                </button>
                <button
                  className={activeTab === "article" ? "active" : ""}
                  onClick={() => setActiveTab("article")}
                >
                  Статья
                </button>
              </div>
            </div>

            <div className="game-toggle-section">
              <div className="toggle-header">
                <span>По играм?</span>
                <button
                  className={`toggle-btn ${!isGameRelated ? "inactive" : ""}`}
                  onClick={() => {
                    setIsGameRelated(false);
                    setSelectedGames([]);
                    setGameSearch("");
                  }}
                >
                  <CloseIcon />
                </button>
                <button
                  className={`toggle-btn ${isGameRelated ? "active" : ""}`}
                  onClick={() => setIsGameRelated(true)}
                >
                  <CheckIcon />
                </button>
              </div>

              {isGameRelated && (
                <div className="game-search-box">
                  <input
                    type="text"
                    placeholder={
                      selectedGames.length >= 4
                        ? "Лимит игр исчерпан"
                        : "Поиск игры для добавления..."
                    }
                    value={gameSearch}
                    onChange={(e) => setGameSearch(e.target.value)}
                    disabled={selectedGames.length >= 4}
                  />
                  {limitError && (
                    <div
                      style={{
                        color: "#ff4d4f",
                        fontSize: "13px",
                        marginTop: "5px",
                        padding: "5px",
                        border: "1px solid #ff4d4f",
                        borderRadius: "4px",
                        background: "rgba(255, 77, 79, 0.1)",
                      }}
                    >
                      {limitError}
                    </div>
                  )}
                  {showDropdown && (
                    <div className="dropdown">
                      {gameOptions.map((g) => (
                        <div
                          key={g.id}
                          className="item"
                          onClick={() => addGame(g)}
                        >
                          {g.background_image && (
                            <img src={g.background_image} alt="" />
                          )}
                          <span>{g.title}</span>
                          <AddIcon className="add-icon" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="selected-games-list">
                    {selectedGames.map((game) => (
                      <div key={game.id} className="selected-game-badge">
                        <span>{game.title}</span>
                        <button onClick={() => removeGame(game.id)}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="right-col">
            <div className="cover-preview">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" />
              ) : (
                <span>Нет обложки</span>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
              accept="image/*"
            />
            <button
              className="file-input-btn"
              onClick={() => fileInputRef.current.click()}
            >
              Загрузить обложку
            </button>
          </div>
        </div>

        <div className="editor-section">
          <Editor ref={editorRef} placeholder="Текст публикации..." />
        </div>

        <div className="actions">
          <button className="cancel" onClick={() => navigate("/publications")}>
            Отмена
          </button>
          <button className="save" onClick={handleSave}>
            Опубликовать
          </button>
        </div>
      </div>
    </div>
  );
}

export default PublicationsWrite;

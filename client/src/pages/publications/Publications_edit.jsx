import { useRef, useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Editor from "../../components/editor/Editor.jsx";
import { AuthContext } from "../../context/authContext";
import "./publications_create.scss";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

function PublicationsEdit() {
  const { publicationId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [activeTab, setActiveTab] = useState("news");
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [isGameRelated, setIsGameRelated] = useState(false);
  const [gameSearch, setGameSearch] = useState("");
  const [gameOptions, setGameOptions] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8800/api/publications/${publicationId}`,
          { withCredentials: true }
        );
        const data = res.data;

        if (
          currentUser.id !== data.author.id &&
          currentUser.role !== "admin" &&
          currentUser.role !== "staff"
        ) {
          navigate("/publications");
          return;
        }

        setTitle(data.title);
        setActiveTab(data.type);
        setImagePreview(data.imageUrl);

        if (editorRef.current) {
          editorRef.current.root.innerHTML = data.content;
        }

        if (data.gameId) {
          setIsGameRelated(true);
          setSelectedGame({ id: data.gameId, title: data.gameTitle });
          setGameSearch(data.gameTitle);
        } else {
          setIsGameRelated(false);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        navigate("/publications");
      }
    };
    if (currentUser) fetchData();
  }, [publicationId, currentUser, navigate]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (gameSearch.length > 1 && !selectedGame && isGameRelated) {
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
  }, [gameSearch, selectedGame, isGameRelated]);

  const handleGameInputChange = (e) => {
    setGameSearch(e.target.value);
    if (selectedGame) setSelectedGame(null);
  };

  const selectGame = (game) => {
    setSelectedGame(game);
    setGameSearch(game.title);
    setShowDropdown(false);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setImagePreview(URL.createObjectURL(selected));
    }
  };

  const handleUpdate = async () => {
    const contentHtml = editorRef.current.root.innerHTML;

    if (!title.trim()) return alert("Введите название");
    if (!contentHtml) return alert("Контент пуст");
    if (isGameRelated && !selectedGame)
      return alert("Выберите игру из списка или отключите привязку к игре");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", contentHtml);
    formData.append("type", activeTab);

    if (isGameRelated && selectedGame) {
      formData.append("game_id", selectedGame.id);
    } else {
      formData.append("game_id", "");
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
        }
      );
      navigate(`/publications/${publicationId}`);
    } catch (err) {
      alert("Ошибка обновления");
    }
  };

  if (loading)
    return (
      <div className="page">
        <div className="container">Загрузка...</div>
      </div>
    );

  return (
    <div className="page">
      <div className="container editor-layout">
        <h1>Редактирование публикации</h1>

        <div className="top-section">
          <div className="left-col">
            <div className="form-group">
              <label>Название</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
                <span>Публикация по игре?</span>
                <button
                  className={`toggle-btn ${!isGameRelated ? "inactive" : ""}`}
                  onClick={() => {
                    setIsGameRelated(false);
                    setSelectedGame(null);
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
                    value={gameSearch}
                    onChange={handleGameInputChange}
                    placeholder="Поиск игры..."
                  />
                  {showDropdown && (
                    <div className="dropdown">
                      {gameOptions.map((g) => (
                        <div
                          key={g.id}
                          className="item"
                          onClick={() => selectGame(g)}
                        >
                          {g.background_image && (
                            <img src={g.background_image} alt="" />
                          )}
                          <span>{g.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedGame && (
                    <div className="selected-game-badge">
                      <span>
                        Выбрано: <strong>{selectedGame.title}</strong>
                      </span>
                      <button
                        onClick={() => {
                          setSelectedGame(null);
                          setGameSearch("");
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="right-col">
            <div className="cover-preview">
              {imagePreview ? (
                <img src={imagePreview} alt="Cover" />
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
              Изменить обложку
            </button>
          </div>
        </div>

        <div className="editor-section">
          <Editor ref={editorRef} publicationId={publicationId} />
        </div>

        <div className="actions">
          <button
            className="cancel"
            onClick={() => navigate(`/publications/${publicationId}`)}
          >
            Отмена
          </button>
          <button className="save" onClick={handleUpdate}>
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}

export default PublicationsEdit;

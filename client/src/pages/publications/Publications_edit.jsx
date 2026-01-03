import { useRef, useState, useEffect, useContext } from "react";
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

  const [activeTab, setActiveTab] = useState("news");
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [game, setGame] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState("");

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
        setGame(data.gameId || "");
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
    formData.append("game_id", game || "");

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
            <div className="gamechoice">
              <p>По игре (ID или название)</p>
              <input
                type="text"
                value={game}
                onChange={(e) => setGame(e.target.value)}
              />
            </div>
            <div className="load-img">
              <p>Картинка публикации</p>
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Предпросмотр" />
                </div>
              )}
              <input type="file" onChange={handleFileChange} />
              <p className="hint">
                Оставьте пустым, чтобы сохранить текущую картинку
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

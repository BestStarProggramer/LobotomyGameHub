import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Editor from "../../components/editor/Editor.jsx";
import "./publications_write.scss";

function PublicationsWrite() {
  const editorRef = useRef(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("news");
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [game, setGame] = useState("");
  const [err, setErr] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
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

    if (file) {
      formData.append("file", file);
    }

    try {
      await axios.post("http://localhost:8800/api/publications", formData, {
        withCredentials: true,
      });
      navigate("/publications");
    } catch (err) {
      console.error("Ошибка при публикации:", err);
      setErr("Что-то пошло не так при создании публикации.");
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="info">
          <h1>Написание Публикации</h1>
          <div className="options">
            <div className="type">
              <p>Я хочу написать...</p>
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
                  Статью
                </button>
              </div>
            </div>
            <div className="title">
              <p>С названием</p>
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
              <p>И у нее будет такая картинка</p>
              <input type="file" onChange={handleFileChange} />
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
              Опубликовать
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublicationsWrite;

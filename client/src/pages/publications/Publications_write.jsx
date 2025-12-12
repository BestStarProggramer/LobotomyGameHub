import { useRef, useState } from "react";
import Editor from "../../components/editor/Editor.jsx";
import "./publications_write.scss";

function PublicationsWrite() {
  const editorRef = useRef(null);
  const [activeTab, setActiveTab] = useState("all");

  function handleSave() {
    const html = editorRef.current.root.innerHTML;
    console.log(html);
  }

  return (
    <div className="page">
      <div className="container">
        <div className="info">
          <h1>Написание Публикации</h1>
          <p>Я хочу написать...</p>
          <div className="tabs">
            <button
              className={`tab ${activeTab === "news" ? "active" : ""}`}
              onClick={() => setActiveTab("news")}
            >
              Новость
            </button>
            <button
              className={`tab ${activeTab === "articles" ? "active" : ""}`}
              onClick={() => setActiveTab("articles")}
            >
              Статью
            </button>
          </div>
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

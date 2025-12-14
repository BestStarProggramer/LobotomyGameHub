import { useRef, useState } from "react";
import Editor from "../../components/editor/Editor.jsx";
import "./publications_write.scss";

function PublicationsWrite() {
  const editorRef = useRef(null);
  const [activeTab, setActiveTab] = useState("all");

  function handleSave() {
    const html = editorRef.current.root.innerHTML;
    console.log("Content HTML:", html);
    console.log("Selected Game:", inputs.game);
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setInputs((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setInputs((prev) => ({ ...prev, [name]: value }));
    }
  };

  const [inputs, setInputs] = useState({
    image: null,
    title: "",
    game: "",
  });

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
                  className={`tab ${activeTab === "articles" ? "active" : ""}`}
                  onClick={() => setActiveTab("articles")}
                >
                  Статью
                </button>
              </div>
            </div>
            <div className="title">
              <p>С названием</p>
              <input type="text" name="title" onChange={handleChange} />
            </div>
            <div className="gamechoice">
              <p>По игре</p>
            </div>
            <div className="load-img">
              <p>И у нее будет такая картинка</p>
              <input type="file" name="image" onChange={handleChange} />
            </div>
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

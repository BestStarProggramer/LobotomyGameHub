import "./publications.scss";
import { useState, useEffect } from "react";
import Publication from "../../components/publication/Publication";
import axios from "axios";

const Publications = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [publicationsData, setPublicationsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublications = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = {};
        if (activeTab !== "all") {
          params.type = activeTab;
        }

        const res = await axios.get("http://localhost:8800/api/publications", {
          params,
          withCredentials: true,
        });

        setPublicationsData(res.data);
      } catch (err) {
        console.error("Ошибка при загрузке публикаций:", err);
        setError("Не удалось загрузить публикации");
        setPublicationsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="publications-page">
        <div className="container">
          <div className="publications-section">
            <h1 className="section-title">Публикации</h1>
            <div className="loading">Загрузка...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="publications-page">
        <div className="container">
          <div className="publications-section">
            <h1 className="section-title">Публикации</h1>
            <div className="error-message">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="publications-page">
      <div className="container">
        <div className="publications-section">
          <h1 className="section-title">Публикации</h1>

          <div className="top">
            <div className="tabs">
              <button
                className={`tab ${activeTab === "all" ? "active" : ""}`}
                onClick={() => handleTabChange("all")}
              >
                Все
              </button>
              <button
                className={`tab ${activeTab === "news" ? "active" : ""}`}
                onClick={() => handleTabChange("news")}
              >
                Новости
              </button>
              <button
                className={`tab ${activeTab === "article" ? "active" : ""}`}
                onClick={() => handleTabChange("article")}
              >
                Статьи
              </button>
            </div>
          </div>

          <div className="bottom">
            {publicationsData.length === 0 ? (
              <div className="no-publications">
                <p>Публикаций пока нет</p>
                <p>Будьте первым, кто создаст публикацию!</p>
              </div>
            ) : (
              <div className="publications-grid">
                {publicationsData.map((publication) => (
                  <Publication key={publication.id} publication={publication} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Publications;

import "./publications.scss";
import { useState } from "react";
import Publication from "../../components/publication/Publication";

const Publications = () => {
  const [activeTab, setActiveTab] = useState("all");

  // Заглушки данных для публикаций
  const publicationsData = [
    {
      id: 1,
      type: "article",
      title: "Топ 10 игр 2024 года, которые вас удивят",
      author: {
        username: "GameCritic",
        avatar: "/img/profilePic.jpg",
      },
      date: "15.11.2024",
      commentsCount: 24,
      imageUrl: "/img/game_poster.jpg",
    },
    {
      id: 2,
      type: "news",
      title: "Новый патч для Cyberpunk 2077 добавляет долгожданные функции",
      author: {
        username: "NewsHunter",
        avatar: "/img/default-avatar.jpg",
      },
      date: "14.11.2024",
      commentsCount: 56,
      imageUrl: "/img/game_banner.jpg",
    },
    {
      id: 3,
      type: "article",
      title: "Гайд: Как пройти сложнейшего босса в Elden Ring",
      author: {
        username: "ProGamer",
        avatar: "/img/profilePic.jpg",
      },
      date: "13.11.2024",
      commentsCount: 18,
      imageUrl: "/img/game_poster.jpg",
    },
    {
      id: 4,
      type: "news",
      title: "Анонсирована дата выхода Hollow Knight: Silksong",
      author: {
        username: "IndieLover",
        avatar: "/img/default-avatar.jpg",
      },
      date: "12.11.2024",
      commentsCount: 142,
      imageUrl: "/img/game_banner.jpg",
    },
    {
      id: 5,
      type: "article",
      title: "Сравнение графики: PlayStation 5 vs Xbox Series X",
      author: {
        username: "TechExpert",
        avatar: "/img/profilePic.jpg",
      },
      date: "11.11.2024",
      commentsCount: 32,
      imageUrl: "/img/game_poster.jpg",
    },
    {
      id: 6,
      type: "news",
      title: "Steam обновляет систему рекомендаций",
      author: {
        username: "PCGamer",
        avatar: "/img/default-avatar.jpg",
      },
      date: "10.11.2024",
      commentsCount: 28,
      imageUrl: "/img/game_banner.jpg",
    },
    {
      id: 7,
      type: "article",
      title: "История развития жанра battle royale",
      author: {
        username: "Historian",
        avatar: "/img/profilePic.jpg",
      },
      date: "09.11.2024",
      commentsCount: 15,
      imageUrl: "/img/game_poster.jpg",
    },
    {
      id: 8,
      type: "news",
      title: "Nintendo анонсировала новую консоль",
      author: {
        username: "ConsoleFan",
        avatar: "/img/default-avatar.jpg",
      },
      date: "08.11.2024",
      commentsCount: 89,
      imageUrl: "/img/game_banner.jpg",
    },
    {
      id: 9,
      type: "article",
      title: "Лучшие инди-игры, которые вы могли пропустить",
      author: {
        username: "IndieExplorer",
        avatar: "/img/profilePic.jpg",
      },
      date: "07.11.2024",
      commentsCount: 21,
      imageUrl: "/img/game_poster.jpg",
    },
  ];

  const filteredPublications =
    activeTab === "all"
      ? publicationsData
      : publicationsData.filter(
          (pub) => pub.type === (activeTab === "news" ? "news" : "article")
        );

  return (
    <div className="publications-page">
      <div className="container">
        <div className="publications-section">
          <h1 className="section-title">Публикации</h1>

          <div className="top">
            <div className="tabs">
              <button
                className={`tab ${activeTab === "all" ? "active" : ""}`}
                onClick={() => setActiveTab("all")}
              >
                Все
              </button>
              <button
                className={`tab ${activeTab === "news" ? "active" : ""}`}
                onClick={() => setActiveTab("news")}
              >
                Новости
              </button>
              <button
                className={`tab ${activeTab === "articles" ? "active" : ""}`}
                onClick={() => setActiveTab("articles")}
              >
                Статьи
              </button>
            </div>
          </div>

          <div className="bottom">
            <div className="publications-grid">
              {filteredPublications.map((publication) => (
                <Publication key={publication.id} publication={publication} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Publications;

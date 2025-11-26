import "./publicationPage.scss";
import PublicationSection from "../../components/publicationsection/PublicationSection";
import CommentBlock from "../../components/commentblock/CommentBlock";

const PublicationPage = () => {
  const publicationData = {
    id: 1,
    type: "article",
    title: "Топ 10 игр 2024 года, которые вас удивят",
    author: {
      username: "GameCritic",
      avatar: "/img/profilePic.jpg",
    },
    date: "15.11.2024",
    commentsCount: 24,
    viewsCount: 1567,
    content: `
      <p>2024 год оказался невероятно богатым на качественные игровые релизы. В этом обзоре мы рассмотрим десять проектов, которые, по нашему мнению, заслуживают особого внимания.</p>

      <h3>1. Cyberpunk 2077: Phantom Liberty</h3>
      <p>Долгожданное дополнение полностью переосмыслило оригинальную игру. Сюжетная линия с Идрисом Эльбой, улучшенная боевая система и масса новых активностей делают Найт-Сити еще более живым и опасным.</p>

      <h3>2. Baldur's Gate 3</h3>
      <p>Несмотря на выход в 2023, игра продолжает получать масштабные обновления. Последнее патч добавил новую ветку развития для темных магов и улучшил ИИ спутников.</p>

      <p>Остальные игры нашего топа...</p>
    `,
  };

  const initialComments = [
    {
      id: 1,
      username: "GamerPro",
      avatar: "/img/default-avatar.jpg",
      date: "15.11.2024 14:30",
      content:
        "Отличная статья! Полностью согласен с подборкой, особенно про Cyberpunk.",
    },
    {
      id: 2,
      username: "IndieLover",
      avatar: "/img/profilePic.jpg",
      date: "15.11.2024 16:45",
      content:
        "Жаль, что в топ не вошли инди-игры. В этом году было много достойных проектов.",
    },
    {
      id: 3,
      username: "ReviewExpert",
      avatar: "/img/default-avatar.jpg",
      date: "16.11.2024 09:15",
      content:
        "Интересный взгляд на релизы года. Жду продолжения про игры на ПК и консолях.",
    },
  ];

  return (
    <div className="publication-page">
      <div className="publication-wrapper">
        <PublicationSection publication={publicationData} />
        <CommentBlock
          comments={initialComments}
          publicationId={publicationData.id}
        />
      </div>
    </div>
  );
};

export default PublicationPage;

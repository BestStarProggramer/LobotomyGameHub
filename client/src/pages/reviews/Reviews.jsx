import "./reviews.scss";
import MainGameCard from "../../components/maingamecard/MainGameCard";
import ReviewsBlock from "../../components/reviewsblock/ReviewsBlock";

const Reviews = () => {
  // Заглушка данных игры "Сейчас в тренде" (со страницы Home)
  const gameData = {
    id: 1,
    title: "Silent Hill f",
    description:
      "Родной город Хинако окутан туманом, что заставляет ее сражаться с гротескными монстрами и решать жуткие головоломки. Раскройте волнующую красоту, скрытую в ужасе.",
    genres: ["Суравйвал хоррор", "Психологический хоррор"],
    rating: 4.3,
    imageUrl: "/img/game_poster.jpg",
  };

  // 5 заглушек для отзывов
  const reviewsList = [
    {
      id: 1,
      username: "NightWarrior",
      avatar: "/img/profilePic.jpg",
      rating: "5.0",
      date: "01.11.2025",
      content:
        "Это просто шедевр! Я ждал эту игру годами, и она полностью оправдала ожидания. Музыка, визуальный стиль, боевка — всё на высшем уровне.",
    },
    {
      id: 2,
      username: "CasualGamer99",
      avatar: "/img/default-avatar.jpg",
      rating: "4.0",
      date: "02.11.2025",
      content:
        "Игра отличная, но для меня сложновата. Порог вхождения выше, чем в первой части. Но атмосфера тащит!",
    },
    {
      id: 3,
      username: "HornetLover",
      avatar: "/img/profilePic.jpg",
      rating: "5.0",
      date: "03.11.2025",
      content:
        "ШАУ! ГИД ГУД! А если серьезно, механика инструментов просто переворачивает геймплей. 10 из 10.",
    },
    {
      id: 4,
      username: "Critic_Zero",
      avatar: "/img/default-avatar.jpg",
      rating: "3.5",
      date: "05.11.2025",
      content:
        "Графика красивая, но мне показалось, что локации слишком затянуты. Бэктрекинг утомляет сильнее, чем раньше.",
    },
    {
      id: 5,
      username: "SpeedRunner",
      avatar: "/img/profilePic.jpg",
      rating: "4.8",
      date: "07.11.2025",
      content:
        "Мувмент стал намного быстрее и плавнее. Хорнет ощущается совершенно иначе, чем Рыцарь. Уже ищу скипы!",
    },
  ];

  const gameId = gameData.id;

  return (
    <div className="reviews-page">
      <div className="container">
        {/* Верхняя часть с информацией об игре */}
        <section className="game-info-section">
          <MainGameCard game={gameData} />
        </section>

        {/* Блок "Отзывы" с оформлением со страницы Game.jsx */}
        <ReviewsBlock
          reviews={reviewsList}
          buttonText="Написать отзыв"
          buttonLink={`/games/${gameId}/write-review`}
        />
      </div>
    </div>
  );
};

export default Reviews;

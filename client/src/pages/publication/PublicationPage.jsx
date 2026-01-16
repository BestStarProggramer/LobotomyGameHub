import "./publicationPage.scss";
import { useContext, useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { makeRequest } from "../../axios";
import PublicationSection from "../../components/publicationsection/PublicationSection";
import CommentBlock from "../../components/commentblock/CommentBlock";
import { AuthContext } from "../../context/authContext";
import { ModalContext } from "../../context/modalContext";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

const PublicationPage = () => {
  const { currentUser } = useContext(AuthContext);
  const { openModal } = useContext(ModalContext);
  const { publicationId } = useParams();
  const navigate = useNavigate();

  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);

  const viewIncremented = useRef(false);

  useEffect(() => {
    const fetchPublication = async () => {
      try {
        const res = await makeRequest.get(`/publications/${publicationId}`);
        const data = res.data;
        setPublication(data);
        setIsLiked(data.isLiked);
        setLikesCount(data.likes);
        setViewsCount(data.views);

        if (!viewIncremented.current) {
          viewIncremented.current = true;
          try {
            await makeRequest.post(`/publications/${publicationId}/view`);

            setViewsCount((prev) => prev + 1);
          } catch (e) {
            console.error("Не удалось обновить просмотры", e);
          }
        }
      } catch (err) {
        console.error("Ошибка при загрузке публикации:", err);
        setError(
          err.response?.data?.error || "Не удалось загрузить публикацию"
        );
      } finally {
        setLoading(false);
      }
    };

    if (publicationId) {
      fetchPublication();
    }
  }, [publicationId]);

  const handleEdit = () => {
    navigate(`/publications/edit/${publicationId}`);
  };

  const handleDelete = () => {
    openModal(
      "Удаление публикации",
      "Вы действительно хотите удалить эту публикацию?",
      async () => {
        setIsDeleting(true);
        try {
          await makeRequest.delete(`/publications/${publicationId}`);
          navigate("/publications");
        } catch (err) {
          console.error("Ошибка при удалении публикации:", err);
          alert(err.response?.data?.error || "Не удалось удалить публикацию");
          setIsDeleting(false);
        }
      }
    );
  };

  const handleLike = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    const prevLiked = isLiked;
    const prevCount = likesCount;

    setIsLiked(!prevLiked);
    setLikesCount((prev) => (prevLiked ? prev - 1 : prev + 1));

    try {
      const res = await makeRequest.post(`/publications/${publicationId}/like`);
      setLikesCount(res.data.likesCount);
      setIsLiked(res.data.isLiked);
    } catch (err) {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      console.error("Ошибка лайка:", err);
    }
  };

  const canEdit =
    currentUser &&
    (currentUser.id === publication?.author?.id ||
      currentUser.role === "staff" ||
      currentUser.role === "admin");

  if (loading) {
    return (
      <div className="publication-page">
        <div className="container">
          <div className="loading">Загрузка публикации...</div>
        </div>
      </div>
    );
  }

  if (error || !publication) {
    return (
      <div className="publication-page">
        <div className="container">
          <div className="error">{error || "Публикация не найдена"}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="publication-page">
      <div className="banner">
        <img
          src={publication.imageUrl || "/img/game_banner.jpg"}
          alt={publication.title}
          className="banner-bg"
        />
        <div className="overlay">
          <div className="container">
            <div className="banner-content">
              <div className="left-side">
                <h1 className="publication-title">{publication.title}</h1>

                <div className="meta-row">
                  <Link
                    to={`/profile/${publication.author.id}`}
                    className="author-link"
                  >
                    <img
                      src={publication.author.avatar}
                      alt={publication.author.username}
                    />
                    <span>{publication.author.username}</span>
                  </Link>

                  <div className="date-badge">
                    <CalendarTodayIcon className="icon-small" />
                    <span>{publication.date}</span>
                  </div>
                </div>

                <div className="stats-container">
                  <div className="stats-row">
                    <div className="stat-item" title="Просмотры">
                      <VisibilityIcon className="icon" />
                      <span>{viewsCount}</span>
                    </div>

                    <div
                      className={`stat-item like-btn ${
                        isLiked ? "active" : ""
                      }`}
                      onClick={handleLike}
                      title={isLiked ? "Убрать лайк" : "Лайкнуть"}
                    >
                      {isLiked ? (
                        <FavoriteIcon className="icon" />
                      ) : (
                        <FavoriteBorderIcon className="icon" />
                      )}
                      <span>{likesCount}</span>
                    </div>
                  </div>

                  {publication.game && (
                    <div className="linked-game-section">
                      <span className="linked-label">
                        {publication.type === "news"
                          ? "Новость по игре:"
                          : "Статья по игре:"}
                      </span>
                      <Link
                        to={`/games/${publication.game.slug}`}
                        className="game-card-mini"
                      >
                        <img
                          src={publication.game.image}
                          alt={publication.game.title}
                        />
                        <span className="game-title">
                          {publication.game.title}
                        </span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              <div className="right-side">
                {canEdit && (
                  <div className="action-buttons">
                    <button
                      onClick={handleEdit}
                      className="icon-btn edit-btn"
                      title="Редактировать"
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={handleDelete}
                      className="icon-btn delete-btn"
                      disabled={isDeleting}
                      title="Удалить"
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container content-wrapper">
        <PublicationSection publication={publication} />
        <CommentBlock publicationId={publication.id} />
      </div>
    </div>
  );
};

export default PublicationPage;

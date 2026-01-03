import "./publicationPage.scss";
import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PublicationSection from "../../components/publicationsection/PublicationSection";
import CommentBlock from "../../components/commentblock/CommentBlock";
import { AuthContext } from "../../context/authContext";

const PublicationPage = () => {
  const { currentUser } = useContext(AuthContext);
  const { publicationId } = useParams();
  const navigate = useNavigate();
  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchPublication = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8800/api/publications/${publicationId}`,
          {
            withCredentials: true,
          }
        );
        setPublication(res.data);
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

  const handleDelete = async () => {
    if (!window.confirm("Вы уверены, что хотите удалить эту публикацию?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await axios.delete(
        `http://localhost:8800/api/publications/${publicationId}`,
        {
          withCredentials: true,
        }
      );
      navigate("/publications");
    } catch (err) {
      console.error("Ошибка при удалении публикации:", err);
      alert(err.response?.data?.error || "Не удалось удалить публикацию");
    } finally {
      setIsDeleting(false);
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
        <div className="publication-wrapper">
          <div className="loading">Загрузка публикации...</div>
        </div>
      </div>
    );
  }

  if (error || !publication) {
    return (
      <div className="publication-page">
        <div className="publication-wrapper">
          <div className="error">{error || "Публикация не найдена"}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="publication-page">
      <div className="publication-wrapper">
        {publication.imageUrl && (
          <div className="publication-image">
            <img src={publication.imageUrl} alt={publication.title} />
          </div>
        )}

        {canEdit && (
          <div className="publication-actions">
            <button onClick={handleEdit} className="edit-button">
              Редактировать
            </button>
            <button
              onClick={handleDelete}
              className="delete-button"
              disabled={isDeleting}
            >
              {isDeleting ? "Удаление..." : "Удалить"}
            </button>
          </div>
        )}

        <PublicationSection publication={publication} />
        <CommentBlock comments={[]} publicationId={publication.id} />
      </div>
    </div>
  );
};

export default PublicationPage;

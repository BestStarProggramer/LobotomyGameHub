import "./publicationPage.scss";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import PublicationSection from "../../components/publicationsection/PublicationSection";
import CommentBlock from "../../components/commentblock/CommentBlock";
import { AuthContext } from "../../context/authContext";

const PublicationPage = () => {
  const { currentUser } = useContext(AuthContext);
  const { publicationId } = useParams();
  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        <PublicationSection publication={publication} />
        <CommentBlock
          comments={[]} // Пока заглушка
          publicationId={publication.id}
        />
      </div>
    </div>
  );
};

export default PublicationPage;

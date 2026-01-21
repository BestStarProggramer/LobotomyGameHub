import "./profile.scss";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { ModalContext } from "../../context/modalContext";
import ProfileHeader from "../../components/profileheader/ProfileHeader";
import ReviewsList from "../../components/reviewslist/ReviewsList";
import axios from "axios";

const Profile = () => {
  const { currentUser } = useContext(AuthContext);
  const { openModal } = useContext(ModalContext);
  const navigate = useNavigate();
  const { UserId } = useParams();

  const [profileData, setProfileData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [favoriteGenres, setFavoriteGenres] = useState([]);

  const targetUserId = UserId || currentUser?.id;

  const isOwnProfile =
    currentUser && String(currentUser.id) === String(targetUserId);
  const isAdmin = currentUser?.role === "admin";
  const canDelete = isOwnProfile || isAdmin;

  useEffect(() => {
    if (!targetUserId && !UserId) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        const userRes = await axios.get(
          `http://localhost:8800/api/auth/user/${targetUserId}`
        );
        const userData = userRes.data;

        let fetchedGenres = [];
        try {
          const genresRes = await axios.get(
            `http://localhost:8800/api/auth/user/${targetUserId}/genres`
          );
          fetchedGenres = genresRes.data || [];
          setFavoriteGenres(fetchedGenres);
        } catch (genresErr) {
          console.error("Не удалось загрузить жанры", genresErr);
          fetchedGenres = [];
        }

        const mappedUserData = {
          id: userData.id,
          username: userData.username,
          avatar: userData.avatar_url || "/img/default-avatar.jpg",
          role: userData.role || "user",
          bio: userData.bio || "",
          registrationDate: userData.registrationDate || "Неизвестно",
          ratedGames: userData.ratedGames || 0,
          favoriteGenres: fetchedGenres,
        };

        setProfileData(mappedUserData);

        const reviewRes = await axios.get(
          `http://localhost:8800/api/reviews/user/${targetUserId}?limit=5`
        );

        const mappedReviews = reviewRes.data.map((r) => ({
          ...r,
          date: new Date(r.created_at).toLocaleDateString("ru-RU"),
          user_id: r.user_id || targetUserId,
        }));
        setReviews(mappedReviews);
      } catch (err) {
        console.error("Error loading profile:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [targetUserId, navigate, UserId]);

  const handleDeleteReview = (reviewId) => {
    if (!reviewId || !canDelete) return;

    openModal(
      "Удаление отзыва",
      "Вы действительно хотите удалить этот отзыв?",
      async () => {
        try {
          const reviewToDelete = reviews.find((r) => r.id === reviewId);
          if (!reviewToDelete) return;

          await axios.delete(
            `http://localhost:8800/api/reviews/game/${reviewToDelete.game?.id}/${reviewId}`,
            { withCredentials: true }
          );

          setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        } catch (err) {
          console.error("Error deleting review:", err);
        }
      }
    );
  };

  if (loading) return <div className="profile">Загрузка...</div>;
  if (error || !profileData)
    return <div className="profile">Ошибка загрузки профиля.</div>;

  return (
    <div className="profile">
      <div className="profile__container">
        {profileData && <ProfileHeader user={profileData} />}

        <div className="profile__reviews-section">
          <div className="section-header">
            <h2>Последние отзывы</h2>
            {reviews.length > 0 && (
              <Link
                to={`/profile/${targetUserId}/reviews`}
                className="view-all-btn"
              >
                Все отзывы
              </Link>
            )}
          </div>

          {reviews.length === 0 ? (
            <p className="no-reviews">Пользователь еще не оставил отзывов.</p>
          ) : (
            <ReviewsList
              reviews={reviews}
              onDelete={canDelete ? handleDeleteReview : null}
              currentUserId={currentUser?.id}
              hideDelete={!canDelete}
              isAdmin={isAdmin}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

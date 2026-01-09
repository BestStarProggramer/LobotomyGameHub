import "./profile.scss";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import ProfileHeader from "../../components/profileheader/ProfileHeader";
import ReviewsList from "../../components/reviewslist/ReviewsList";
import axios from "axios";

const Profile = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const { UserId } = useParams();

  const [profileData, setProfileData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [favoriteGenres, setFavoriteGenres] = useState([]);

  const targetUserId = UserId || currentUser?.id;
  const isOwnProfile = currentUser && currentUser.id === parseInt(targetUserId);

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

        try {
          const genresRes = await axios.get(
            `http://localhost:8800/api/auth/user/${targetUserId}/genres`
          );
          const genres = genresRes.data;
          setFavoriteGenres(genres || []);
        } catch (genresErr) {
          console.log("Не удалось загрузить жанры:", genresErr);
          setFavoriteGenres([]);
        }

        const mappedUserData = {
          id: userData.id,
          username: userData.username,
          avatar: userData.avatar_url || "/img/default-avatar.jpg",
          role: userData.role || "user",
          bio: userData.bio || "",
          registrationDate: userData.registrationDate || "Неизвестно",
          ratedGames: userData.ratedGames || 0,
          favoriteGenres: favoriteGenres,
        };

        console.log("Profile data:", mappedUserData);
        setProfileData(mappedUserData);

        const reviewRes = await axios.get(
          `http://localhost:8800/api/reviews/user/${targetUserId}?limit=5`
        );

        console.log("Reviews data:", reviewRes.data);

        const mappedReviews = reviewRes.data.map((r) => ({
          ...r,
          date: new Date(r.created_at).toLocaleDateString("ru-RU"),
          user_id: r.user_id || targetUserId,
        }));
        setReviews(mappedReviews);
      } catch (err) {
        console.error("Error loading profile:", err.response?.data || err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [targetUserId, navigate, UserId]);

  useEffect(() => {
    if (profileData) {
      setProfileData((prev) => ({
        ...prev,
        favoriteGenres: favoriteGenres,
      }));
    }
  }, [favoriteGenres]);

  const handleDeleteReview = async (reviewId) => {
    if (!reviewId || !isOwnProfile) {
      console.log("Cannot delete: no reviewId or not own profile");
      return;
    }

    try {
      const reviewToDelete = reviews.find((r) => r.id === reviewId);
      if (!reviewToDelete) {
        alert("Отзыв не найден");
        return;
      }

      console.log(
        "Deleting review:",
        reviewId,
        "game:",
        reviewToDelete.game?.id
      );

      await axios.delete(
        `http://localhost:8800/api/reviews/game/${reviewToDelete.game?.id}/${reviewId}`,
        {
          withCredentials: true,
        }
      );

      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      alert("Отзыв успешно удален");
    } catch (err) {
      console.error("Error deleting review:", err.response?.data || err);
      alert(
        "Не удалось удалить отзыв: " +
          (err.response?.data?.error || err.message)
      );
    }
  };

  if (loading) return <div className="profile">Загрузка...</div>;
  if (error || !profileData)
    return <div className="profile">Ошибка загрузки профиля.</div>;

  console.log("Rendering profile. Is own profile?", isOwnProfile);
  console.log("Current user ID:", currentUser?.id);
  console.log("Target user ID:", targetUserId);
  console.log("Reviews count:", reviews.length);

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
              onDelete={isOwnProfile ? handleDeleteReview : null}
              currentUserId={currentUser?.id}
              hideDelete={!isOwnProfile}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

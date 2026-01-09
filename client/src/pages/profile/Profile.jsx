import "./profile.scss";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom"; // Added Link, useParams
import { AuthContext } from "../../context/authContext";
import ProfileHeader from "../../components/profileheader/ProfileHeader";
import ReviewsList from "../../components/reviewslist/ReviewsList"; // Import ReviewsList
import axios from "axios";

const Profile = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const { UserId } = useParams(); // Get ID from URL

  const [profileData, setProfileData] = useState(null);
  const [reviews, setReviews] = useState([]); // State for reviews
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Determine which ID to load (URL param or logged in user)
  const targetUserId = UserId || currentUser?.id;

  useEffect(() => {
    if (!targetUserId) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await axios.get("http://localhost:8800/api/auth/profile", {
          withCredentials: true,
        });

        const data = res.data;

        const mappedUserData = {
          id: data.id,
          username: data.username,
          avatar: data.avatar_url || "/img/default-avatar.jpg",
          role: data.role,
          bio: data.bio,
          registrationDate: data.registrationDate
            ? new Date(data.registrationDate).toLocaleDateString("ru-RU")
            : "Неизвестно",
          ratedGames: data.ratedGames,
          favoriteGenres: Array.isArray(data.favoriteGenres)
            ? data.favoriteGenres
            : [],
        };
        setProfileData(mappedUserData);

        const reviewRes = await axios.get(
          `http://localhost:8800/api/reviews/user/${targetUserId}?limit=5`,
          { withCredentials: true }
        );

        const mappedReviews = reviewRes.data.map((r) => ({
          ...r,
          date: new Date(r.created_at).toLocaleDateString("ru-RU"),
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
  }, [targetUserId, navigate]);

  if (loading) return <div className="profile">Загрузка...</div>;
  if (error || !profileData)
    return <div className="profile">Ошибка загрузки.</div>;

  return (
    <div className="profile">
      <div className="profile__container">
        <ProfileHeader user={profileData} />

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
            <ReviewsList reviews={reviews} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

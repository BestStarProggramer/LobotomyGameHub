import "./profile.scss";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import ProfileHeader from "../../components/profileheader/ProfileHeader";
import axios from "axios";

const Profile = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (currentUser) {
      const fetchProfile = async () => {
        try {
          const res = await axios.get(
            "http://localhost:8800/api/auth/profile",
            {
              withCredentials: true,
            }
          );

          const data = res.data;

          const mappedUserData = {
            id: data.id,
            username: data.username,
            avatar: data.img || "/img/default_profilePic.jpg",
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
        } catch (err) {
          console.error("Ошибка при загрузке профиля:", err);
          setError(true);
          setProfileData(null);
        } finally {
          setLoading(false);
        }
      };

      fetchProfile();
    }
  }, [currentUser]);

  if (!currentUser) {
    return null;
  }

  if (loading) {
    return <div className="profile">Загрузка данных профиля...</div>;
  }

  if (error || !profileData) {
    return (
      <div className="profile error-state">
        Ошибка: Не удалось загрузить данные профиля. Попробуйте обновить
        страницу.
      </div>
    );
  }

  return (
    <div className="profile">
      <div className="profile__container">
        <ProfileHeader user={profileData} />
      </div>
    </div>
  );
};

export default Profile;

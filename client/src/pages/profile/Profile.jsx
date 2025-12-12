import "./profile.scss";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import ProfileHeader from "../../components/profileheader/ProfileHeader";

const Profile = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null;
  }

  const userData = {
    username: "5Hnet5K",
    avatar: "/img/profilePic.jpg",
    role: "Сотрудник редакции",
    bio: "Немного играю в игры, немного пишу рецензии. Я тут с самого основания. На объективность особо не рассчитывайте, так как при оценке руководствуюсь в основном общими впечатлениями. А ну и если есть какие-то вопросы по сайту - можете писать мне, возможно я даже отвечу",
    registrationDate: "13.10.2025",
    ratedGames: 777,
    favoriteGenres: [
      "RPG",
      "Adventure",
      "Choices Matter",
      "Story Rich",
      "Cyberpunk",
    ],
  };

  return (
    <div className="profile">
      <div className="profile__container">
        <ProfileHeader user={userData} />
      </div>
    </div>
  );
};

export default Profile;

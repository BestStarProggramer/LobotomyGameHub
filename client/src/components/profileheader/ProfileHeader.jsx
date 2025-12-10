import "./profileHeader.scss";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import StarIcon from "@mui/icons-material/Star";
import FavoriteIcon from "@mui/icons-material/Favorite";
import InfoIcon from "@mui/icons-material/Info";

const ProfileHeader = ({ user }) => {
  return (
    <div className="profile-header">
      {/* Avatar */}
      <div className="profile-header__avatar-section">
        <img
          src={user.avatar}
          alt={user.username}
          className="profile-header__avatar"
        />
        <div className="profile-header__role">{user.role}</div>
      </div>

      {/* Info */}
      <div className="profile-header__info">
        {/* Title */}
        <div className="profile-header__title">
          <div className="profile-header__icon">
            <InfoIcon style={{ fontSize: "30px", color: "white" }} />
          </div>
          <h1>О профиле</h1>
        </div>

        {/* Username */}
        <h2 className="profile-header__username">{user.username}</h2>

        {/* Bio */}
        <p className="profile-header__bio">{user.bio}</p>

        {/* Stats */}
        <div className="profile-header__stats">
          <div className="profile-header__stat">
            <AccessTimeIcon />
            <span>Дата регистрации: {user.registrationDate}</span>
          </div>
          <div className="profile-header__stat">
            <StarIcon />
            <span>Оценено игр: {user.ratedGames}</span>
          </div>
        </div>

        {/* Favorite Genres */}
        <div className="profile-header__genres">
          <div className="profile-header__genres-title">
            <FavoriteIcon className="profile-header__heart-icon" />
            <span>Любимые жанры:</span>
          </div>
          <div className="profile-header__genres-list">
            {user.favoriteGenres.map((genre, index) => (
              <span key={index} className="profile-header__genre-tag">
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;

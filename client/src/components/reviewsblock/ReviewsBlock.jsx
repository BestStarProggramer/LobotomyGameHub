import "./reviewsBlock.scss";
import { Link } from "react-router-dom";
import ReviewsList from "../reviewslist/ReviewsList";

/**
 * Компонент, отображающий секцию отзывов с фоном, заголовком и кнопкой.
 * Стиль скопирован с Game.jsx.
 * * @param {Array} reviews - Массив объектов отзывов для отображения.
 * @param {string} buttonText - Текст на кнопке.
 * @param {string} buttonLink - Ссылка для кнопки.
 */
const ReviewsBlock = ({ reviews, buttonText, buttonLink }) => {
  return (
    <div className="reviews_section">
      <div className="top">
        <h1>Отзывы</h1>

        {/* Кнопка с настраиваемым текстом и ссылкой */}
        <Link to={buttonLink} className="button_reviews">
          <p>{buttonText}</p>
        </Link>
      </div>

      <div className="bottom">
        {/* Используем ReviewsList для отображения массива отзывов */}
        <ReviewsList reviews={reviews} />
      </div>
    </div>
  );
};

export default ReviewsBlock;

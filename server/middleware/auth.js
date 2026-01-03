import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    console.log("Middleware: Токен не найден в куках", req.cookies);
    return res.status(401).json("Вы не авторизованы!");
  }

  const SECRET_KEY = process.env.JWT_SECRET || "your_jwt_secret_key";

  jwt.verify(token, SECRET_KEY, (err, userInfo) => {
    if (err) {
      console.log("Middleware: Ошибка валидации токена", err);
      return res.status(403).json("Токен недействителен!");
    }

    req.userInfo = userInfo;
    next();
  });
};

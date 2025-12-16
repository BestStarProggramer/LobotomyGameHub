import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(401).json("Вы не авторизованы!");
  }

  const SECRET_KEY = process.env.JWT_SECRET_KEY || "your_jwt_secret_key";

  jwt.verify(token, SECRET_KEY, (err, userInfo) => {
    if (err) {
      return res.status(403).json("Токен недействителен!");
    }

    req.userInfo = userInfo;

    next();
  });
};

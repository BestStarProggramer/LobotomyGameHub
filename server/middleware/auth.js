import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "your_jwt_secret_key";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "30d";

const cookieOptions = {
  httpOnly: true,

  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

export const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json("Вы не авторизованы!");
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        console.log("Middleware: Ошибка валидации токена", err.message);
        return res.status(403).json("Токен недействителен!");
      }

      req.userInfo = decoded;

      const payload = {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role,
      };

      const newToken = jwt.sign(payload, SECRET_KEY, {
        expiresIn: JWT_EXPIRES,
      });

      res.cookie("accessToken", newToken, cookieOptions);

      next();
    });
  } catch (err) {
    console.error("verifyToken middleware unexpected error:", err);
    return res.status(500).json("Ошибка сервера при проверке токена");
  }
};

export const checkAuth = (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    req.userInfo = null;
    return next();
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      req.userInfo = null;
    } else {
      req.userInfo = decoded;
    }
    next();
  });
};

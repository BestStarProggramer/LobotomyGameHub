import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Header from "./components/Header";
import Articles from "./pages/Articles";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import GameDetail from "./pages/GameDetail";
import GameReviews from "./pages/GameReviews";
import CreateReview from "./pages/CreateReview";
import EditReview from "./pages/EditReview";
import CreateArticle from "./pages/CreateArticle";
import EditArticle from "./pages/EditArticle";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserProfile from "./pages/UserProfile";
import NotFound from "./pages/NotFound";
import ArticleDetail from "./pages/ArticleDetail";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Получаем пользователя из localStorage один раз при монтировании
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  return (
    <Router>
      <Header user={user} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/game/:id" element={<GameDetail />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/article/:id" element={<ArticleDetail user={user} />} />
        <Route path="/user/:id" element={<UserProfile user={user} />} />
        <Route path="/game/:id/reviews" element={<GameReviews />} />

        <Route
          path="/game/:id/review/create"
          element={user ? <CreateReview /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/game/:id/review/edit/:reviewId"
          element={user ? <EditReview /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/article/create"
          element={user ? <CreateArticle /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/article/edit/:articleId"
          element={user ? <EditArticle /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/profile"
          element={
            user ? (
              <UserProfile user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;

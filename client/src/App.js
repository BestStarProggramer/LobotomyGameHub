import {
  BrowserRouter,
  createBrowserRouter,
  RouterProvider,
  Route,
  Outlet,
} from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/authContext";
import Login from "./pages/login/Login.jsx";
import Register from "./pages/register/Register.jsx";
import Navbar from "./components/navbar/Navbar.jsx";
import Home from "./pages/home/Home.jsx";
import Profile from "./pages/profile/Profile.jsx";
import NotFound from "./pages/notfound/NotFound.jsx";
import ForgotPassword from "./pages/forgotpassword/ForgotPassword.jsx";
import ResetPassword from "./pages/resetpassword/ResetPassword.jsx";
import Game from "./pages/game/Game.jsx";
import Games from "./pages/games/Games.jsx";
import Reviews from "./pages/reviews/Reviews.jsx";
import Publications from "./pages/publications/Publications.jsx";
import PublicationPage from "./pages/publication/PublicationPage.jsx";
import Settings from "./pages/settings/Settings.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function App() {
  const { currentUser } = useContext(AuthContext);

  const queryClient = new QueryClient();

  const Layout = () => {
    return (
      <QueryClientProvider client={queryClient}>
        <div>
          <Navbar />
          <Outlet />
        </div>
      </QueryClientProvider>
    );
  };

  const ProtectedRoute = ({ children }) => {
    // По идее сайт можно просматривать если не авторизован, но этот кусок кода может понадобиться,
    // так что оставлю его пока в закомментированном виде

    // if (!currentUser) {
    //   return <Login />;
    // }
    return children;
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "/games",
          element: <Games />,
        },

        {
          path: "/publications",
          element: <Publications />,
        },

        {
          path: "/publications/:publicationId",
          element: <PublicationPage />,
        },

        {
          path: "/profile/:UserId",
          element: <Profile />,
        },

        {
          path: "/settings/:UserId",
          element: <Settings />,
        },

        {
          path: "/games/:GameId",
          element: <Game />,
        },

        {
          path: "/games/:GameId/reviews",
          element: <Reviews />,
        },
      ],
    },

    {
      path: "/forgot-password",
      element: <ForgotPassword />,
    },
    {
      path: "/reset-password",
      element: <ResetPassword />,
    },
    {
      path: "*",
      element: <NotFound />,
    },

    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
  ]);

  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;

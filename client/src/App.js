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
import Game from "./pages/game/Game.jsx";

function App() {
  const { currentUser } = useContext(AuthContext);

  const Layout = () => {
    return (
      <div>
        <Navbar />
        <Outlet />
      </div>
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
          path: "/profile/:UserId",
          element: <Profile />,
        },

        {
          path: "/games/:GameId",
          element: <Game />,
        },
      ],
    },

    {
      path: "/forgot-password",
      element: <ForgotPassword />,
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

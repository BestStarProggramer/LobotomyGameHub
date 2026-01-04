import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const login = async (inputs) => {
    try {
      const res = await axios.post(
        "http://localhost:8800/api/auth/login",
        inputs,
        { withCredentials: true }
      );
      setCurrentUser(res.data.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post("http://localhost:8800/api/auth/logout", null, {
        withCredentials: true,
      });
      setCurrentUser(null);
      localStorage.removeItem("user");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const updateCurrentUser = (updatedData) => {
    setCurrentUser((prev) => {
      const newUser = { ...prev, ...updatedData };
      localStorage.setItem("user", JSON.stringify(newUser));
      return newUser;
    });
  };

  const refreshUserData = async () => {
    try {
      const res = await axios.get("http://localhost:8800/api/auth/profile", {
        withCredentials: true,
      });
      const data = res.data;

      updateCurrentUser({
        username: data.username,
        avatar_url: data.avatar_url || data.img,
        bio: data.bio,
      });
    } catch (err) {
      console.error("Ошибка обновления данных пользователя:", err);
    }
  };

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        updateCurrentUser,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

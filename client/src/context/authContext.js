import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [initializing, setInitializing] = useState(true);

  const login = async (inputs) => {
    try {
      const res = await axios.post(
        "http://localhost:8800/api/auth/login",
        inputs,
        { withCredentials: true }
      );
      const user = res.data.user;
      setCurrentUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      return user;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post("http://localhost:8800/api/auth/logout", null, {
        withCredentials: true,
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setCurrentUser(null);
      localStorage.removeItem("user");
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

      const normalized = {
        id: data.id,
        username: data.username,
        email: data.email,
        role: data.role,
        avatar_url: data.avatar_url || data.img || null,
        bio: data.bio || null,
      };
      setCurrentUser((prev) => {
        const merged = { ...(prev || {}), ...normalized };
        localStorage.setItem("user", JSON.stringify(merged));
        return merged;
      });
      return normalized;
    } catch (err) {
      console.error(
        "Ошибка обновления данных пользователя:",
        err?.response?.data || err.message
      );
      setCurrentUser(null);
      localStorage.removeItem("user");
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        await refreshUserData();
      } catch (err) {
      } finally {
        if (mounted) setInitializing(false);
      }
    };
    init();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        initializing,
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

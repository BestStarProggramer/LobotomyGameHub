import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const login = () => {
    // Сделать надо попозже
    setCurrentUser({
      id: 1,
      username: "5Hnet5K",
      email: "3sheepcanfly3@gmail.com",
      password_hash: "iwoejdoiqo",
      role: "admin",
      bio: "lorem ipsum dorem.......",
      avatar_url: "/img/profilePic.jpg",
      created_at: "2024-06-01T12:00:00Z",
    });
  };

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, login }}>
      {children}
    </AuthContext.Provider>
  );
};

import { useEffect, useContext, useRef } from "react";
import { AuthContext } from "../../context/authContext";

const AutoLogout = ({ children }) => {
  const { currentUser, logout } = useContext(AuthContext);

  const mountedAuthStatus = useRef(!!currentUser);

  useEffect(() => {
    if (mountedAuthStatus.current) {
      logout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return children;
};

export default AutoLogout;

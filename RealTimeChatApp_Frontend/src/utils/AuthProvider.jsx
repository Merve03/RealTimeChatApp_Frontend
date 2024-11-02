import { createContext, useContext, useState } from "react";
import { TokenService } from "../services/TokenService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userData) => {
    setUser(userData);
    TokenService.setTokens(userData.accessToken, userData.refreshToken);
  };

  const logout = () => {
    setUser(null);
    TokenService.removeTokens();
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => useContext(AuthContext);

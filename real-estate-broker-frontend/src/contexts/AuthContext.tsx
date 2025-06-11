// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

interface AuthContextType {
  isAuthenticated: boolean;
  role: string;
  login: (accessToken: string, role: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsAuthenticated(!!token);

    if (token) {
      api.get("/users/profile")
        .then(res => setRole(res.data.role))
        .catch(() => setRole(""))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (accessToken: string, roleFromServer: string) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("role", roleFromServer);
    setIsAuthenticated(true);
    setRole(roleFromServer);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    setIsAuthenticated(false);
    setRole("");
  };

  if (loading) return null; // або global spinner

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

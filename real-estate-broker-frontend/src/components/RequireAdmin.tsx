import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { JSX } from "react/jsx-runtime";

const RequireAdmin: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const location = useLocation();
  const role = localStorage.getItem("role");

  if (role !== "ADMIN") {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAdmin;

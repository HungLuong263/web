import React from "react";
import { Navigate } from "react-router-dom";
import { isTokenExpired } from "../lib/jwtDecode.ts";
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const isExpired = isTokenExpired(token);
  if (isExpired) {
    localStorage.removeItem("token");
  }
  return token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;

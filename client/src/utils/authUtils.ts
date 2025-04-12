//import { useNavigate } from "react-router-dom";

export const logoutUser = () => {
  localStorage.removeItem("role");
  localStorage.removeItem("token");
  localStorage.removeItem("access_token_expiry");
  window.location.href = "/signin"; // Redirect to sign-in page
  
};

export const isTokenExpired = (): boolean => {
  const accessTokenExpiry = localStorage.getItem("access_token_expiry");
  if (!accessTokenExpiry) return true;

  const now = new Date().getTime();
  return now > parseInt(accessTokenExpiry, 10);
};

export const checkSession = () => {
  const token = localStorage.getItem("token");
  if (!token || isTokenExpired()) {
    logoutUser();
  }
};
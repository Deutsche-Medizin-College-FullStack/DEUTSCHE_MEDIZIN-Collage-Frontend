import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("xy9a7b");

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child routes (via Outlet)
  return <Outlet />;
};

export default ProtectedRoute;
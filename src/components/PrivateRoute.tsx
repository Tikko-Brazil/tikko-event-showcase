import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  // If private routes are explicitly disabled, allow access without authentication
  if (import.meta.env.VITE_ENABLE_PRIVATE_ROUTES === 'false') {
    return <>{children}</>;
  }

  const token = localStorage.getItem("accessToken");

  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

export default PrivateRoute;

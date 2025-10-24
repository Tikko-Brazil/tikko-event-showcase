import { Navigate } from "react-router";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const token = localStorage.getItem("accessToken");

  return token ? <Navigate to="/feed" replace /> : <>{children}</>;
};

export default PublicRoute;

import { Navigate } from 'react-router-dom';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const token = localStorage.getItem('accessToken');
  
  return token ? <Navigate to="/feed" replace /> : <>{children}</>;
};

export default PublicRoute;

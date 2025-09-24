import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const token = localStorage.getItem('accessToken');
  
  return token ? <>{children}</> : <Navigate to="/auth" replace />;
};

export default PrivateRoute;

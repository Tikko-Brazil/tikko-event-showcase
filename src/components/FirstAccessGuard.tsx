import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface FirstAccessGuardProps {
  children: React.ReactNode;
}

const FirstAccessGuard: React.FC<FirstAccessGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const isFirstAccess = localStorage.getItem('isFirstAccess');
    
    // If user has token and is first access, redirect to profile completion
    if (accessToken && isFirstAccess === 'true' && location.pathname !== '/profile-completion') {
      navigate('/profile-completion');
    }
  }, [navigate, location.pathname]);

  return <>{children}</>;
};

export default FirstAccessGuard;

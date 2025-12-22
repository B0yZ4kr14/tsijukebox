import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';

// Redirect to new /auth page
export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    } else {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  return null;
}

import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

interface UseBackNavigationOptions {
  fallbackPath?: string;
  showToast?: boolean;
  toastMessage?: string;
}

export function useBackNavigation(options: UseBackNavigationOptions = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    fallbackPath = '/',
    showToast = true,
    toastMessage = 'Redirecionando para a página inicial'
  } = options;

  const goBack = () => {
    // location.key === 'default' significa que não há histórico de navegação
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate(fallbackPath);
      if (showToast) {
        toast.info(toastMessage);
      }
    }
  };

  const hasHistory = location.key !== 'default';

  return { goBack, hasHistory, navigate, location };
}

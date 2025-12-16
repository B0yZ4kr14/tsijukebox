import { STORAGE_KEYS } from '@/lib/constants';

export function useFirstAccess() {
  const isFirstAccess = !localStorage.getItem(STORAGE_KEYS.SETUP_COMPLETE);
  
  const markSetupComplete = () => {
    localStorage.setItem(STORAGE_KEYS.SETUP_COMPLETE, 'true');
  };
  
  const resetSetup = () => {
    localStorage.removeItem(STORAGE_KEYS.SETUP_COMPLETE);
  };

  return { isFirstAccess, markSetupComplete, resetSetup };
}

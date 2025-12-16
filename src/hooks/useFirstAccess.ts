const SETUP_COMPLETE_KEY = 'tsi_jukebox_setup_complete';

export function useFirstAccess() {
  const isFirstAccess = !localStorage.getItem(SETUP_COMPLETE_KEY);
  
  const markSetupComplete = () => {
    localStorage.setItem(SETUP_COMPLETE_KEY, 'true');
  };
  
  const resetSetup = () => {
    localStorage.removeItem(SETUP_COMPLETE_KEY);
  };

  return { isFirstAccess, markSetupComplete, resetSetup };
}

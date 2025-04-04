import { useState, useEffect } from 'react';

const STORAGE_KEY = 'altify_warning_accepted';

export function useWarningPopup() {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem(STORAGE_KEY);
    if (!hasAccepted) {
      setShowWarning(true);
    }
  }, []);

  const acceptWarning = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setShowWarning(false);
  };

  return {
    showWarning,
    acceptWarning
  };
}
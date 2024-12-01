// slapjack/client/src/hooks/useKeyPress.js
import { useEffect } from 'react';

export function useKeyPress(targetKey, handler) {
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === targetKey) {
        event.preventDefault();
        handler();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [targetKey, handler]);
}
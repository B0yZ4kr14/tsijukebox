import { useEffect } from 'react';
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

export function useWebVitals() {
  useEffect(() => {
    onCLS(console.log);
    onFID(console.log);
    onLCP(console.log);
    onFCP(console.log);
    onTTFB(console.log);
  }, []);
}

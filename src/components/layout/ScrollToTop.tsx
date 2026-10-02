import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      return;
    }
    // Les pages sont chargées à la demande : on attend que l'ancre existe.
    const id = decodeURIComponent(hash.slice(1));
    let tries = 0;
    const timer = setInterval(() => {
      const el = document.getElementById(id);
      if (el || ++tries > 40) {
        clearInterval(timer);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
    return () => clearInterval(timer);
  }, [pathname, hash]);

  return null;
}

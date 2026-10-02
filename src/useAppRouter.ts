import { useState, useEffect, useCallback } from 'react';

export type RoutePath = '/' | '/login' | '/signup' | '/app' | '/dashboard';

export function useAppRouter() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window === 'undefined') return '/';
    return window.location.pathname || '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((to: string, replace = false) => {
    if (typeof window === 'undefined') return;

    try {
      const targetUrl = new URL(to, window.location.origin);
      const targetPath = targetUrl.pathname || '/';
      const fullTarget = targetPath + targetUrl.search + targetUrl.hash;
      const currentFull = window.location.pathname + window.location.search + window.location.hash;

      if (currentFull !== fullTarget) {
        if (replace) {
          window.history.replaceState({}, '', fullTarget);
        } else {
          window.history.pushState({}, '', fullTarget);
        }
      }

      setCurrentPath(targetPath);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      if (replace) {
        window.history.replaceState({}, '', to);
      } else {
        window.history.pushState({}, '', to);
      }
      setCurrentPath(to.split('?')[0] || '/');
    }
  }, []);

  return { currentPath, navigate };
}
export default useAppRouter;

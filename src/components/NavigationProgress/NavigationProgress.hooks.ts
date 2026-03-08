'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';

export function useNavigationProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const incrementTimer = useRef<ReturnType<typeof setInterval>>(undefined);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const navigating = useRef(false);

  const cleanup = useCallback(() => {
    clearInterval(incrementTimer.current);
    clearTimeout(hideTimer.current);
  }, []);

  const start = useCallback(() => {
    cleanup();
    navigating.current = true;
    setVisible(true);
    setProgress(0);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setProgress(30);

        incrementTimer.current = setInterval(() => {
          setProgress((p) => {
            if (p >= 85) {
              clearInterval(incrementTimer.current);
              return 85;
            }
            return p + (85 - p) * 0.08;
          });
        }, 400);
      });
    });
  }, [cleanup]);

  const done = useCallback(() => {
    if (!navigating.current) return;
    navigating.current = false;
    cleanup();
    setProgress(100);
    hideTimer.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 300);
  }, [cleanup]);

  // Route changed → complete
  useEffect(() => {
    done();
  }, [pathname, done]);

  // Intercept link clicks and back/forward navigation
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const a = (e.target as HTMLElement).closest('a');
      if (!a) return;

      const href = a.getAttribute('href');
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:')
      )
        return;

      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target && a.target !== '_self') return;

      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        if (
          url.pathname === window.location.pathname &&
          url.search === window.location.search
        )
          return;
      } catch {
        return;
      }

      start();
    }

    document.addEventListener('click', onClick, true);
    window.addEventListener('popstate', start);

    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('popstate', start);
      cleanup();
    };
  }, [start, cleanup]);

  // Safety: auto-complete after 10s
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(done, 10_000);
    return () => clearTimeout(t);
  }, [visible, done]);

  return { progress, visible };
}

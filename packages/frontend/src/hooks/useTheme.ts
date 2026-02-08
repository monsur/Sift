import { useEffect } from 'react';
import { useAuthStore } from '@stores/authStore';

export function useTheme() {
  const profile = useAuthStore((s) => s.profile);
  const theme = profile?.settings?.theme ?? 'system';

  useEffect(() => {
    function applyTheme(t: 'light' | 'dark' | 'system') {
      if (t === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (t === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        // system
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    }

    applyTheme(theme);

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => {
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [theme]);
}

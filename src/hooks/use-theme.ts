import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return 'system'; // Default for SSR or build time
    }
    return (localStorage.getItem('theme') as Theme) || 'system';
  });

  const applyTheme = useCallback((selectedTheme: Theme) => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    let effectiveTheme: 'light' | 'dark';
    if (selectedTheme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveTheme = systemPrefersDark ? 'dark' : 'light';
    } else {
      effectiveTheme = selectedTheme;
    }

    root.classList.add(effectiveTheme);
    localStorage.setItem('theme', selectedTheme); // Store the user's preference (light, dark, or system)
    setThemeState(selectedTheme); // Update the hook's state
  }, []);

  // Effect to apply theme on initial load and when theme state changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Effect to listen for system theme changes when theme is 'system'
  useEffect(() => {
    if (theme !== 'system') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      // Re-apply theme which will detect the new system preference
      applyTheme('system');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);

  const setTheme = (newTheme: Theme) => {
    applyTheme(newTheme);
  };

  return { theme, setTheme };
}
import { useEffect, useCallback } from 'react';

// Theme type is no longer needed as we enforce 'light'
// type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  // State is no longer needed, but we keep the hook structure
  // const [theme, setThemeState] = useState<Theme>('light'); // Always light

  const applyTheme = useCallback(() => {
    // Always apply 'light' theme
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      root.classList.remove('dark'); // Ensure dark class is removed if present
      root.classList.add('light'); // Always add light class
      // localStorage interaction is removed
      // localStorage.setItem('theme', 'light');
    }
    // setThemeState('light'); // State update is removed
  }, []);

  // Effect to apply theme on initial load
  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  // System theme listener effect is removed

  // setTheme function is removed as theme is fixed
  // const setTheme = (newTheme: Theme) => {
  //   applyTheme(newTheme);
  // };

  // Return a fixed theme value and a no-op setter
  return { theme: 'light' as const /*, setTheme: () => {} */ };
}
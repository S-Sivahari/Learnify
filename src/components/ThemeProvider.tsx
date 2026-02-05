import { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { isDyslexia, isColorblind } = useThemeStore();

  // Only apply accessibility modes, no theme switching
  useEffect(() => {
    const root = document.documentElement;

    // Remove theme classes
    root.classList.remove('light', 'dark', 'colorblind', 'dyslexia');

    // Add accessibility modes only
    if (isDyslexia) {
      root.classList.add('dyslexia');
    }

    if (isColorblind) {
      root.classList.add('colorblind');
    }
  }, [isDyslexia, isColorblind]);

  return <>{children}</>;
}

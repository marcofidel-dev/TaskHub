import { useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';
import { colorPalettes } from '../config/themes';

export function ThemeProvider({ children }) {
  const { isDarkMode, colorPalette } = useThemeStore();
  const colors = colorPalettes[colorPalette] || colorPalettes.indigo;

  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-background', isDarkMode ? colors.darkBackground : colors.background);
    root.style.setProperty('--color-text', isDarkMode ? colors.darkText : colors.text);
    root.style.setProperty('--color-border', isDarkMode ? colors.darkBorder : colors.border);

    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode, colorPalette, colors]);

  return <>{children}</>;
}

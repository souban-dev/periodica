import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

export interface DarkPaletteInfo {
  name: string;
  canvasHex: string;
  surfaceHex: string;
  surfaceHoverHex: string;
  borderHex: string;
  accentHex: string;
  glowColor: string;
}

export const GUNMETAL_CHARCOAL_THEME: DarkPaletteInfo = {
  name: 'Gunmetal Charcoal',
  canvasHex: '#121316',
  surfaceHex: '#1a1b20',
  surfaceHoverHex: '#22252c',
  borderHex: '#292c35',
  accentHex: '#f59e0b',
  glowColor: 'rgba(245, 158, 11, 0.12)',
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  currentDarkPaletteInfo: DarkPaletteInfo;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
  currentDarkPaletteInfo: GUNMETAL_CHARCOAL_THEME,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('periodica_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // ignore
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
      root.style.setProperty('--color-canvas', GUNMETAL_CHARCOAL_THEME.canvasHex);
      root.style.setProperty('--color-surface', GUNMETAL_CHARCOAL_THEME.surfaceHex);
      root.style.setProperty('--color-surface-hover', GUNMETAL_CHARCOAL_THEME.surfaceHoverHex);
      root.style.setProperty('--color-border', GUNMETAL_CHARCOAL_THEME.borderHex);
      root.style.setProperty('--color-accent', GUNMETAL_CHARCOAL_THEME.accentHex);
      root.style.setProperty('--color-glow', GUNMETAL_CHARCOAL_THEME.glowColor);
      document.body.style.backgroundColor = GUNMETAL_CHARCOAL_THEME.canvasHex;
      document.documentElement.style.backgroundColor = GUNMETAL_CHARCOAL_THEME.canvasHex;
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
      root.style.setProperty('--color-canvas', '#f8fafc');
      root.style.setProperty('--color-surface', '#ffffff');
      root.style.setProperty('--color-surface-hover', '#f1f5f9');
      root.style.setProperty('--color-border', '#e2e8f0');
      root.style.setProperty('--color-accent', '#f59e0b');
      root.style.setProperty('--color-glow', 'rgba(245, 158, 11, 0.08)');
      document.body.style.backgroundColor = '#f8fafc';
      document.documentElement.style.backgroundColor = '#f8fafc';
    }
    try {
      localStorage.setItem('periodica_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        currentDarkPaletteInfo: GUNMETAL_CHARCOAL_THEME,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

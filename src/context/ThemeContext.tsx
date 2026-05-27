'use client';

import React from 'react';

type Theme = 'dark' | 'light';
type ThemeContextValue = { theme: Theme; toggle: () => void };

const ThemeContext = React.createContext<ThemeContextValue>({ theme: 'dark', toggle: () => {} });

export const useTheme = () => React.useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = React.useState<Theme>('dark');

  React.useLayoutEffect(() => {
    const domTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    if (domTheme !== theme) {
      // DOM was set by anti-FOUC script — sync React to DOM without touching the DOM
      setTheme(domTheme);
      return;
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = React.useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
};

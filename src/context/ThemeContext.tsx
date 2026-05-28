"use client";

import React from "react";

type Theme = "dark" | "light";
type ThemeContextValue = { theme: Theme; toggle: () => void };

const ThemeContext = React.createContext<ThemeContextValue>({
  theme: "dark",
  toggle: () => {},
});

export const useTheme = () => React.useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = React.useState<Theme>(() => {
    // Read DOM on client — anti-FOUC script already set data-theme before React mounts
    if (typeof document !== "undefined") {
      return document.documentElement.getAttribute("data-theme") === "light"
        ? "light"
        : "dark";
    }
    return "dark";
  });

  React.useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = React.useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};

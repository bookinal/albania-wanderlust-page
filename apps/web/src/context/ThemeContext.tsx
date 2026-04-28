import * as React from "react";

type Theme = "dark" | "light" | "blue";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
  isLight: boolean;
  isBlue: boolean;
}

const ThemeContext = React.createContext<ThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {},
  isDark: true,
  isLight: false,
  isBlue: false,
});

export const useTheme = () => React.useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = React.useState<Theme>(() => {
    try {
      const stored = localStorage.getItem("alb-theme");
      if (stored === "light" || stored === "dark" || stored === "blue") {
        return stored;
      }
    } catch {}
    return "dark";
  });

  const toggleTheme = React.useCallback(() => {
    setTheme((prev) => {
      const next =
        prev === "dark" ? "light" : prev === "light" ? "blue" : "dark";
      try {
        localStorage.setItem("alb-theme", next);
      } catch {}
      return next;
    });
  }, []);

  React.useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle("dark", theme === "dark");

    if (theme === "blue") {
      root.setAttribute("data-theme", "blue");
    } else {
      root.removeAttribute("data-theme");
    }
  }, [theme]);

  const value = React.useMemo(
    () => ({
      theme,
      toggleTheme,
      isDark: theme === "dark",
      isLight: theme === "light",
      isBlue: theme === "blue",
    }),
    [theme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

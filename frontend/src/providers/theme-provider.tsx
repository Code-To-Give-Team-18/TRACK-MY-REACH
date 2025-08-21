'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'light',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (typeof window !== 'undefined' && (localStorage.getItem(storageKey) as Theme)) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    // Force light mode - remove any dark class and always add light
    root.classList.remove('dark');
    root.classList.add('light');
    
    // Ignore theme changes and always use light
    return;
  }, [theme]);

  const value = {
    theme: 'light' as Theme, // Always return 'light' as the current theme
    setTheme: (theme: Theme) => {
      // Force light mode - ignore any theme change attempts
      localStorage.setItem(storageKey, 'light');
      setTheme('light');
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
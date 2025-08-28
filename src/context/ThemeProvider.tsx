
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface ThemeProviderState {
  theme: string;
  setTheme: (theme: string) => void;
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState('light');

  useEffect(() => {
    const storedTheme = localStorage.getItem('eventide_theme');
    if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
      setThemeState(storedTheme);
    } else {
        // If no theme is stored, or if it's 'system', default to light
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setThemeState(systemTheme);
    }
  }, []);

  const setTheme = (newTheme: string) => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(newTheme);
    localStorage.setItem('eventide_theme', newTheme);
    setThemeState(newTheme);
  }

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};


"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { updateUserTheme, getUserProfile } from '@/services/supabase';

interface ThemeProviderState {
  theme: string;
  setTheme: (theme: string) => void;
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState('light');
  const { user } = useAuth();

  useEffect(() => {
    const applyTheme = async () => {
        if (user?.email) {
            const userProfile = await getUserProfile(user.email);
            if (userProfile?.theme) {
                setAndApplyTheme(userProfile.theme);
            } else {
                 setAndApplyTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
            }
        } else {
            // Fallback for logged-out users
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            setAndApplyTheme(systemTheme);
        }
    }
    applyTheme();
  }, [user]);

  const setAndApplyTheme = (newTheme: string) => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(newTheme);
    localStorage.setItem('eventide_theme', newTheme); // Keep for initial flicker prevention
    setThemeState(newTheme);
  }

  const setTheme = async (newTheme: string) => {
    setAndApplyTheme(newTheme);
    if (user?.email) {
      // Silently update the theme in the background without showing a toast.
      await updateUserTheme(user.email, newTheme);
    }
  }

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

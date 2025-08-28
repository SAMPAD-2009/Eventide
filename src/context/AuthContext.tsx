
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";
import { createUserInBaserow } from '@/services/baserow';
import { generateAvatar } from '@/lib/utils';
import { useRouter } from 'next/navigation';

// This is a simplified, mock authentication context.
// In a real application, you would integrate with a service like Firebase Auth.

interface User {
  id: string;
  email: string;
  photoURL: string;
  theme: 'light' | 'dark';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (photo: File) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user database
const mockUsers: Record<string, User> = {};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
    // Check if user is "logged in" from a previous session
    try {
        const storedUser = localStorage.getItem('eventide_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    } catch(e) {
        console.error("Failed to parse user from local storage", e);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      // In a real app, you'd verify credentials against a backend.
      // Here, we'll just check if the user exists in our mock local storage "DB".
      const storedUsers = JSON.parse(localStorage.getItem('eventide_users') || '{}');
      if (storedUsers[email] && storedUsers[email].password === pass) {
        const loggedInUser = storedUsers[email].user;
        setUser(loggedInUser);
        localStorage.setItem('eventide_user', JSON.stringify(loggedInUser));
        toast({ title: "Login Successful", description: "Welcome back!" });
        return true;
      } else {
        toast({ variant: 'destructive', title: "Login Failed", description: "Invalid email or password." });
        return false;
      }
    } catch(e) {
        toast({ variant: 'destructive', title: "Error", description: "An unexpected error occurred during login." });
        return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
        const storedUsers = JSON.parse(localStorage.getItem('eventide_users') || '{}');
        if (storedUsers[email]) {
            toast({ variant: 'destructive', title: "Signup Failed", description: "An account with this email already exists." });
            return false;
        }

        const newUser: User = {
            id: new Date().toISOString(),
            email,
            photoURL: `data:image/svg+xml;base64,${btoa(
                `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="#cccccc"></rect><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="50" fill="#ffffff">${generateAvatar(email)}</text></svg>`
            )}`,
            theme: 'light',
        };

        const baserowResult = await createUserInBaserow({ email, photoURL: newUser.photoURL, theme: newUser.theme });

        if (!baserowResult.success) {
             toast({ variant: 'destructive', title: "Signup Failed", description: "Could not save user to the database. " + baserowResult.error });
             return false;
        }
        
        // Store user and "password" in mock local storage DB
        storedUsers[email] = { password: pass, user: newUser };
        localStorage.setItem('eventide_users', JSON.stringify(storedUsers));
        
        setUser(newUser);
        localStorage.setItem('eventide_user', JSON.stringify(newUser));

        toast({ title: "Signup Successful", description: "Your account has been created." });
        return true;
    } catch(e: any) {
         toast({ variant: 'destructive', title: "Error", description: e.message || "An unexpected error occurred during signup." });
         return false;
    } finally {
        setIsLoading(false);
    }
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('eventide_user');
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.push('/login');
  };

  const updateUserProfile = async (photo: File): Promise<boolean> => {
    if (!user) return false;
    setIsLoading(true);
     try {
        // In a real app, this would upload to a service like Firebase Storage
        // and return a URL. Here, we'll convert it to a Data URL.
        const reader = new FileReader();
        const promise = new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
        reader.readAsDataURL(photo);
        const photoURL = await promise;

        const updatedUser = { ...user, photoURL };
        
        // Update mock user database
        const storedUsers = JSON.parse(localStorage.getItem('eventide_users') || '{}');
        if (storedUsers[user.email]) {
            const password = storedUsers[user.email].password;
            storedUsers[user.email] = { password, user: updatedUser };
            localStorage.setItem('eventide_users', JSON.stringify(storedUsers));
        }

        setUser(updatedUser);
        localStorage.setItem('eventide_user', JSON.stringify(updatedUser));
        
        return true;
     } catch (e) {
        toast({ variant: 'destructive', title: "Update Failed", description: "Could not update profile picture." });
        return false;
     } finally {
        setIsLoading(false);
     }
  }


  const contextValue = { user, login, signup, logout, updateUserProfile, isLoading };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

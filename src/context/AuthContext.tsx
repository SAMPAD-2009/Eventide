
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile, User as FirebaseUser } from "firebase/auth";
import { app } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { createUserInBaserow, getUserFromBaserow, updateUserPhotoInBaserow } from '@/services/baserow';


interface User {
  uid: string;
  email: string | null;
  photoURL: string | null;
  displayName: string | null;
  baserowUserId?: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (email: string, pass: string, username: string) => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (photo: File) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const auth = getAuth(app);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const baserowUser = await getUserFromBaserow(firebaseUser.email!);
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          photoURL: baserowUser?.['Photo URL'] || firebaseUser.photoURL,
          displayName: firebaseUser.displayName,
          baserowUserId: baserowUser?.id
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      toast({ title: "Login Successful", description: "Welcome back!" });
      return true;
    } catch (error: any) {
      toast({ variant: 'destructive', title: "Login Failed", description: error.message });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, pass: string, username: string) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      
      const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`;

      await updateProfile(firebaseUser, {
        displayName: username,
        photoURL: defaultAvatar,
      });

      const baserowResult = await createUserInBaserow({ 
        email, 
        username,
        theme: 'light', 
        photoURL: defaultAvatar 
      });
      
      if (!baserowResult.success || !baserowResult.data) {
        console.error("Failed to create user in Baserow:", baserowResult.error);
        toast({
          variant: 'destructive',
          title: "Signup Warning",
          description: "Your account was created, but we failed to sync with our database. Please contact support.",
        });
      }

      setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          photoURL: defaultAvatar,
          displayName: username,
          baserowUserId: baserowResult.data?.id
        });

      toast({ title: "Signup Successful", description: "Your account has been created." });
      return true;
    } catch (error: any) {
      toast({ variant: 'destructive', title: "Signup Failed", description: error.message });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
        await signOut(auth);
        toast({ title: "Logged Out", description: "You have been successfully logged out." });
        router.push('/login');
    } catch(e: any) {
        toast({ variant: 'destructive', title: "Error", description: e.message || "An unexpected error occurred during logout." });
    } finally {
        setIsLoading(false);
    }
  };

  const updateUserProfile = async (photo: File): Promise<boolean> => {
    if (!auth.currentUser || !user?.email) return false;
    setIsLoading(true);

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(photo);
      reader.onload = async () => {
        try {
          const base64Photo = reader.result as string;

          const updateResult = await updateUserPhotoInBaserow({
            email: user.email!,
            photoURL: base64Photo,
          });

          if (!updateResult.success || !updateResult.data) {
            throw new Error(updateResult.error || 'Failed to update user photo in Baserow');
          }

          setUser(prevUser => prevUser ? { ...prevUser, photoURL: base64Photo } : null);

          toast({ title: "Profile Updated", description: "Your profile picture has been changed." });
          setIsLoading(false);
          resolve(true);
        } catch (e: any) {
          console.error("Profile update error:", e);
          toast({ variant: 'destructive', title: "Update Failed", description: e.message || "Could not update profile picture." });
          setIsLoading(false);
          resolve(false);
        }
      };
      reader.onerror = (error) => {
        console.error("File reading error:", error);
        toast({ variant: 'destructive', title: "Update Failed", description: "Could not read the selected file." });
        setIsLoading(false);
        reject(error);
      }
    });
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

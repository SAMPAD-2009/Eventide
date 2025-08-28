
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile, User as FirebaseUser } from "firebase/auth";
import { app } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { generateAvatar } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { createUserInBaserow } from '@/services/baserow';


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
  signup: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (photo: File) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const auth = getAuth(app);
const storage = getStorage(app);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          displayName: firebaseUser.displayName,
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

  const signup = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      
      const defaultAvatar = `data:image/svg+xml;base64,${btoa(
        `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="#cccccc"></rect><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="50" fill="#ffffff">${generateAvatar(email)}</text></svg>`
      )}`;

      await updateProfile(firebaseUser, {
        photoURL: defaultAvatar,
      });

      // Create user in Baserow
      const baserowResult = await createUserInBaserow({ email, theme: 'light', photoURL: defaultAvatar });
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
          displayName: firebaseUser.displayName,
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
    if (!auth.currentUser) return false;
    setIsLoading(true);
    try {
      const storageRef = ref(storage, `avatars/${auth.currentUser.uid}/${photo.name}`);
      await uploadBytes(storageRef, photo);
      const photoURL = await getDownloadURL(storageRef);
      
      await updateProfile(auth.currentUser, { photoURL });

      setUser(prevUser => prevUser ? { ...prevUser, photoURL } : null);

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


"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile, User as FirebaseUser, updatePassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { usePathname, useRouter } from 'next/navigation';
import { createUserInBaserow, getUserFromBaserow, updateUserPhotoInBaserow, updateUserUsernameInBaserow } from '@/services/baserow';


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
  signInWithGoogle: () => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (photo: File) => Promise<boolean>;
  updateUserUsername: (username: string) => Promise<boolean>;
  updateUserPassword: (password: string) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Define paths that are public (accessible to non-logged-in users)
const PUBLIC_PATHS = ['/login', '/signup', '/terms', '/privacy'];

// Define paths that a logged-in user should be redirected from (e.g., away from login/signup)
const AUTH_REDIRECT_PATHS = ['/login', '/signup'];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialAuthCheck, setInitialAuthCheck] = useState(false);

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
      setInitialAuthCheck(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!initialAuthCheck) {
      return; // Wait for the initial auth check to complete
    }

    const isPublicPath = PUBLIC_PATHS.includes(pathname);
    const isAdminPath = pathname.startsWith('/admin');
    
    // Determine if the current path is one from which a logged-in user should be redirected.
    const isAuthRedirectPath = AUTH_REDIRECT_PATHS.includes(pathname);

    // Allow admin user to access admin path
    if (user?.email === 'sampad81@admin.com' && isAdminPath) {
       setIsLoading(false);
       return;
    }

    if (user && isAuthRedirectPath) {
      router.push('/');
    } else if (!user && !isPublicPath) {
      router.push('/login');
    }
    setIsLoading(false);

  }, [user, pathname, router, initialAuthCheck]);


  const login = async (email: string, pass: string) => {
    setIsLoading(true);

    // Admin user check before Firebase authentication
    if (email === 'sampad81@admin.com' && pass === 'sam@2009') {
        try {
            // We still sign in the admin user to firebase to get a user session
            await signInWithEmailAndPassword(auth, email, pass);
            toast({ title: "Admin Login Successful", description: "Welcome, Admin!" });
            router.push('/admin');
            return true;
        } catch (error: any) {
             // If admin doesn't exist in Firebase, we can create it here or just show an error.
             // For now, we'll assume the admin must exist in firebase auth as well.
             toast({ variant: 'destructive', title: "Admin Login Failed", description: "Admin user not found in Firebase. Please sign up first." });
             setIsLoading(false);
             return false;
        }
    }

    try {
      await signInWithEmailAndPassword(auth, email, pass);
      toast({ title: "Login Successful", description: "Welcome back!" });
      // For regular users, onAuthStateChanged will handle redirect to '/' via useEffect
      return true;
    } catch (error: any) {
      toast({ variant: 'destructive', title: "Login Failed", description: error.message });
      return false;
    } finally {
       // Let onAuthStateChanged handle loading state to avoid flashes
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
        // Don't set isLoading to false here. The onAuthStateChanged listener will handle it.
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const firebaseUser = userCredential.user;

      const existingBaserowUser = await getUserFromBaserow(firebaseUser.email!);

      if (!existingBaserowUser) {
        const baserowResult = await createUserInBaserow({
          email: firebaseUser.email!,
          username: firebaseUser.displayName!,
          theme: 'light',
          photoURL: firebaseUser.photoURL!,
        });

        if (!baserowResult.success) {
           console.error("Failed to create user in Baserow after Google sign-in:", baserowResult.error);
           toast({
              variant: 'destructive',
              title: "Signup Warning",
              description: "Your account was created, but we failed to sync with our database. Please contact support.",
           });
        }
      }

      toast({ title: "Login Successful", description: "Welcome!" });
      router.push('/');
      return true;

    } catch (error: any) {
      toast({ variant: 'destructive', title: "Google Sign-In Failed", description: error.message });
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
        reject(false);
      }
    });
  }
  
  const updateUserUsername = async (username: string): Promise<boolean> => {
    if (!auth.currentUser || !user?.email) return false;
    setIsLoading(true);
    try {
        await updateProfile(auth.currentUser, { displayName: username });

        const updateResult = await updateUserUsernameInBaserow({
            email: user.email,
            username: username
        });

        if (!updateResult.success) {
            throw new Error(updateResult.error || 'Failed to update username in Baserow');
        }
        
        setUser(prevUser => prevUser ? { ...prevUser, displayName: username } : null);
        return true;

    } catch (e: any) {
        console.error("Username update error:", e);
        toast({ variant: 'destructive', title: "Update Failed", description: e.message || "Could not update username." });
        return false;
    } finally {
        setIsLoading(false);
    }
  }

  const updateUserPassword = async (password: string): Promise<boolean> => {
      if (!auth.currentUser) return false;
      setIsLoading(true);
      try {
          await updatePassword(auth.currentUser, password);
          return true;
      } catch (e: any) {
          toast({ 
              variant: 'destructive', 
              title: "Update Failed", 
              description: e.message || "Could not update password. Please log out and log back in before trying again." 
          });
          return false;
      } finally {
          setIsLoading(false);
      }
  };


  const contextValue = { user, login, signup, signInWithGoogle, logout, updateUserProfile, updateUserUsername, updateUserPassword, isLoading };

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

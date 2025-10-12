
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile, User as FirebaseUser, updatePassword, GoogleAuthProvider, signInWithPopup, updateEmail, deleteUser, linkWithPopup } from "firebase/auth";
import { app } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { usePathname, useRouter } from 'next/navigation';
import { createUserProfile, getUserProfile, updateUserProfilePhoto, updateUserProfileUsername, updateUserEmailInDb, deleteUserData } from '@/services/supabase';


interface User {
  uid: string;
  email: string | null;
  photoURL: string | null;
  displayName: string | null;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (email: string, pass: string, username: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (photo: File) => Promise<boolean>;
  updateUserUsername: (username: string) => Promise<void>;
  updateUserPassword: (password: string) => Promise<boolean>;
  updateUserEmail: (newEmail: string) => Promise<void>;
  deleteUserAccount: () => Promise<void>;
  linkWithGoogle: () => Promise<void>;
  isLoading: boolean;
  landingPage: string;
  setLandingPage: (page: string) => void;
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
  const [landingPage, setLandingPage] = useState('/');
  const [initialRedirect, setInitialRedirect] = useState(false);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser && firebaseUser.email) {
        const userProfile = await getUserProfile(firebaseUser.email);
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          photoURL: userProfile?.photo_url || firebaseUser.photoURL,
          displayName: userProfile?.username || firebaseUser.displayName,
        });
        setLandingPage(userProfile?.landing_page || '/');
      } else {
        setUser(null);
      }
      setInitialAuthCheck(true);
      setInitialRedirect(false); // Reset redirect flag on auth state change
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!initialAuthCheck) {
      return; // Wait for the initial auth check to complete
    }

    const isPublicPath = PUBLIC_PATHS.includes(pathname);
    const isAuthRedirectPath = AUTH_REDIRECT_PATHS.includes(pathname);

    if (user) {
        // Redirect from /login or /signup to landing page
        if (isAuthRedirectPath) {
            router.push(landingPage);
            return;
        }

        // Perform initial redirect to landing page if necessary
        if (pathname === '/' && landingPage !== '/' && !initialRedirect) {
            router.push(landingPage);
            setInitialRedirect(true); // Mark that initial redirect has happened
        }
    } else {
      // If the user is not logged in and not on a public path,
      // redirect them to the login page.
      if (!isPublicPath) {
        router.push('/login');
      }
    }
    
    // We can set loading to false after the first check.
    // The router will handle the view transition.
    setIsLoading(false);

  }, [user, pathname, router, initialAuthCheck, landingPage, initialRedirect]);


  const login = async (email: string, pass: string) => {
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      if (firebaseUser.email) {
          const profile = await getUserProfile(firebaseUser.email);
          const targetLandingPage = profile?.landing_page || '/';
          setLandingPage(targetLandingPage);
          router.push(targetLandingPage);
          toast({ title: "Login Successful", description: "Welcome back!" });
          return true;
      }
      return false;
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

      const profileResult = await createUserProfile({ 
        id: firebaseUser.uid,
        email, 
        username,
        theme: 'light', 
        photo_url: defaultAvatar 
      });
      
      if (profileResult.error) {
        console.error("Failed to create user profile in Supabase:", profileResult.error);
        toast({
          variant: 'destructive',
          title: "Signup Warning",
          description: "Your account was created, but we failed to sync your profile. Please contact support.",
        });
      }

      setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          photoURL: defaultAvatar,
          displayName: username,
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

      if (!firebaseUser.email) {
        throw new Error("Google sign-in did not provide an email address.");
      }

      const existingProfile = await getUserProfile(firebaseUser.email);
      let targetLandingPage = '/';

      if (!existingProfile) {
        const profileResult = await createUserProfile({
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          username: firebaseUser.displayName!,
          theme: 'light',
          photo_url: firebaseUser.photoURL!,
        });

        if (profileResult.error) {
           console.error("Failed to create user profile in Supabase after Google sign-in:", profileResult.error);
           toast({
              variant: 'destructive',
              title: "Signup Warning",
              description: "Your account was created, but we failed to sync your profile. Please contact support.",
           });
        }
      } else {
        targetLandingPage = existingProfile.landing_page || '/';
      }
      
      setLandingPage(targetLandingPage);
      router.push(targetLandingPage);
      toast({ title: "Login Successful", description: "Welcome!" });
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
    if (!auth.currentUser || !auth.currentUser.email) return false;
    setIsLoading(true);

    const currentUserEmail = auth.currentUser.email;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(photo);
      reader.onload = async () => {
        try {
          const base64Photo = reader.result as string;

          const { error } = await updateUserProfilePhoto(currentUserEmail, base64Photo);

          if (error) {
            throw new Error(error.message || 'Failed to update user photo in Supabase');
          }

          // Also update Firebase auth profile photo if you want it there too, though not strictly necessary
          await updateProfile(auth.currentUser!, { photoURL: base64Photo });

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
  
  const updateUserUsername = async (username: string) => {
    if (!auth.currentUser || !auth.currentUser.email) return;
    setIsLoading(true);
    try {
        await updateProfile(auth.currentUser, { displayName: username });

        const { error } = await updateUserProfileUsername(auth.currentUser.email, username);

        if (error) {
            throw new Error(error.message || 'Failed to update username in Supabase');
        }
        
        setUser(prevUser => prevUser ? { ...prevUser, displayName: username } : null);
        toast({ title: "Profile Updated", description: "Your username has been changed." });

    } catch (e: any) {
        console.error("Username update error:", e);
        toast({ variant: 'destructive', title: "Update Failed", description: e.message || "Could not update username." });
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

    const updateUserEmail = async (newEmail: string) => {
    if (!auth.currentUser || !user?.email) {
      toast({ variant: 'destructive', title: "Not Authenticated", description: "No user is currently logged in." });
      return;
    }
    if (user.email === newEmail) {
        return; // No change needed
    }
    setIsLoading(true);
    const oldEmail = user.email;

    try {
      // 1. Update email in Firebase Auth
      await updateEmail(auth.currentUser, newEmail);
      
      // 2. Update email in Supabase tables
      const { error } = await updateUserEmailInDb(oldEmail, newEmail);
      if (error) {
        // If Supabase update fails, we should ideally try to revert Firebase auth email.
        // This is complex, so for now we'll log the error and notify the user.
        throw new Error(error);
      }

      // 3. Update local user state
      setUser(prev => prev ? { ...prev, email: newEmail } : null);

      toast({ title: "Email Updated", description: `Your email has been changed to ${newEmail}. Please log in again.` });
      // Force logout to re-authenticate with the new email
      await signOut(auth);
      router.push('/login');

    } catch (e: any) {
      toast({ variant: 'destructive', title: "Email Update Failed", description: e.message || "An unexpected error occurred. You may need to log out and log back in." });
    } finally {
      setIsLoading(false);
    }
  };

  const linkWithGoogle = async () => {
    if (!auth.currentUser) {
        toast({ variant: 'destructive', title: "Not Authenticated", description: "No user is currently logged in." });
        return;
    }
    setIsLoading(true);
    try {
        const result = await linkWithPopup(auth.currentUser, googleProvider);
        const newEmail = result.user.email;

        if (newEmail && newEmail !== user?.email) {
            await updateUserEmail(newEmail);
        } else {
             toast({ title: "Account Linked", description: "Your Google account has been successfully linked." });
        }
    } catch (error: any) {
        let description = error.message;
        if (error.code === 'auth/credential-already-in-use') {
            description = 'This Google account is already associated with another user. Please use a different one.';
        }
        toast({
            variant: 'destructive',
            title: 'Failed to Link Account',
            description: description
        });
    } finally {
        setIsLoading(false);
    }
  };

  const deleteUserAccount = async () => {
    if (!auth.currentUser || !user?.email) {
      toast({ variant: 'destructive', title: "Not Authenticated", description: "No user is currently logged in." });
      return;
    }
    setIsLoading(true);
    const userEmail = user.email;

    try {
      // 1. Delete user data from Supabase
      const { error: dbError } = await deleteUserData(userEmail);
      if (dbError) {
        throw new Error(dbError);
      }
      
      // 2. Delete user from Firebase Auth
      await deleteUser(auth.currentUser);

      toast({ title: "Account Deleted", description: "Your account and all associated data have been permanently deleted." });
      // The onAuthStateChanged listener will automatically handle redirecting to /login
    } catch (e: any) {
       toast({ variant: 'destructive', title: "Deletion Failed", description: e.message || "An unexpected error occurred." });
    } finally {
       setIsLoading(false);
    }
  }


  const contextValue = { user, login, signup, signInWithGoogle, logout, updateUserProfile, updateUserUsername, updateUserPassword, updateUserEmail, deleteUserAccount, linkWithGoogle, isLoading, landingPage, setLandingPage };

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

    
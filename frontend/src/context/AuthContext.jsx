"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "@/utils/firebase";

const AuthContext = createContext({
  user: null,
  session: null,
  status: "loading",
  loginWithGoogle: async () => {},
  loginWithGithub: async () => {},
  loginWithEmail: async (email, password) => {},
  signupWithEmail: async (email, password, name) => {},
  sendPhoneOtp: async (phoneNumber, appVerifier) => {},
  logout: async () => {},
});

export const AuthProviderWrapper = ({ children }) => {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const formattedUser = {
          uid: currentUser.uid,
          name:
            currentUser.displayName ||
            (currentUser.email ? currentUser.email.split("@")[0] : `User_${currentUser.uid.slice(0, 5)}`),
          // SECURITY FIX (M-03): Anonymize phone auth placeholder email to avoid leaking phone numbers
          email: currentUser.email || `user_${currentUser.uid.toLowerCase()}@phone.user`,
          image: currentUser.photoURL || null,
          phoneNumber: currentUser.phoneNumber || null,
        };
        setUser(formattedUser);
        setStatus("authenticated");
      } else {
        setUser(null);
        setStatus("unauthenticated");
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(auth, provider);
  };

  const loginWithGithub = async () => {
    const provider = new GithubAuthProvider();
    return await signInWithPopup(auth, provider);
  };

  const loginWithEmail = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  const signupWithEmail = async (email, password, name) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    if (name && res.user) {
      await updateProfile(res.user, { displayName: name });
    }
    return res;
  };

  const sendPhoneOtp = async (phoneNumber, appVerifier) => {
    return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  };

  const logout = async () => {
    return await firebaseSignOut(auth);
  };

  const sessionData = user ? { user } : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        session: sessionData,
        data: sessionData, // for compatibility with NextAuth useSession()
        status,
        loginWithGoogle,
        loginWithGithub,
        loginWithEmail,
        signupWithEmail,
        sendPhoneOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// Hook to maintain backward-compatibility with next-auth useSession()
export const useSession = () => {
  const context = useContext(AuthContext);
  return {
    data: context?.session || null,
    status: context?.status || "loading",
  };
};

export const signOut = async () => {
  return await firebaseSignOut(auth);
};

export default AuthContext;

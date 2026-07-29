"use client";

import { AuthProviderWrapper } from "@/context/AuthContext";

const AuthProvider = ({ children }) => {
  return <AuthProviderWrapper>{children}</AuthProviderWrapper>;
};

export default AuthProvider;
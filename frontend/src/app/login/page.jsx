"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { RecaptchaVerifier } from "firebase/auth";
import { auth } from "@/utils/firebase";
import styles from "./loginPage.module.css";

const LoginPage = () => {
  const {
    status,
    loginWithGoogle,
    loginWithGithub,
    loginWithEmail,
    signupWithEmail,
    sendPhoneOtp,
  } = useAuth();

  const router = useRouter();

  // Auth Method Tab: 'social', 'email', 'phone'
  const [activeTab, setActiveTab] = useState("social");

  // Email / Password state
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // Phone OTP state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpSent, setOtpSent] = useState(false);

  // Status/Error state
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const recaptchaContainerRef = useRef(null);
  const recaptchaVerifierRef = useRef(null);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Clean up recaptcha verifier when switching tabs
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (e) {}
      }
    };
  }, [activeTab]);

  const formatAuthError = (err) => {
    const msg = err?.message || "";
    const code = err?.code || "";
    
    if (code === "auth/popup-closed-by-user") {
      return "Sign-in window was closed before completing.";
    }
    if (code === "auth/operation-not-allowed" || msg.includes("operation-not-allowed")) {
      return "This sign-in provider is not enabled in Firebase Console (Authentication -> Sign-in method).";
    }
    if (code === "auth/unauthorized-domain" || msg.includes("unauthorized-domain")) {
      return "Domain not authorized. Ensure 'localhost' is in Firebase Console -> Authentication -> Authorized domains.";
    }
    if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
      return "Invalid email or password. Please check your credentials.";
    }
    if (code === "auth/email-already-in-use") {
      return "An account already exists with this email. Please log in instead.";
    }
    if (msg.includes("Database is closing") || msg.includes("IndexedDB") || msg.includes("hidden")) {
      return "Browser local storage was busy. Please click the button once more to sign in.";
    }
    return msg || "Authentication failed. Please try again.";
  };

  // Handle Social Login (Google / GitHub)
  const handleSocialLogin = async (provider) => {
    setError("");
    setLoading(true);
    try {
      if (provider === "google") {
        await loginWithGoogle();
      } else if (provider === "github") {
        await loginWithGithub();
      }
      router.push("/");
    } catch (err) {
      console.error("Social login error:", err);
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  // Handle Email Login / Signup
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        await signupWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
      router.push("/");
    } catch (err) {
      console.error("Email auth error:", err);
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };


  // Initialize Recaptcha for Phone Auth
  const setupRecaptcha = () => {
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {},
        }
      );
    }
    return recaptchaVerifierRef.current;
  };

  // Send Phone OTP
  const handleSendPhoneOtp = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const appVerifier = setupRecaptcha();
      const result = await sendPhoneOtp(phoneNumber, appVerifier);
      setConfirmationResult(result);
      setOtpSent(true);
      setInfo("OTP sent to " + phoneNumber + ". Check your phone!");
    } catch (err) {
      console.error("Phone OTP error:", err);
      setError(err.message || "Failed to send OTP. Include country code (e.g. +1 or +91).");
    } finally {
      setLoading(false);
    }
  };

  // Verify Phone OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!confirmationResult) {
        throw new Error("No OTP request found. Please resend OTP.");
      }
      await confirmationResult.confirm(otpCode);
      router.push("/");
    } catch (err) {
      console.error("OTP verification error:", err);
      setError(err.message || "Invalid OTP code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <div className={styles.loading}>Loading authentication...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.badge}>b/</div>
          <h1 className={styles.title}>Join BotBlogs</h1>
          <p className={styles.subtitle}>
            Sign in with Firebase Auth via Google, GitHub, Email, or Phone.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tabBtn} ${
              activeTab === "social" ? styles.activeTab : ""
            }`}
            onClick={() => {
              setActiveTab("social");
              setError("");
            }}
          >
            Social
          </button>
          <button
            className={`${styles.tabBtn} ${
              activeTab === "email" ? styles.activeTab : ""
            }`}
            onClick={() => {
              setActiveTab("email");
              setError("");
            }}
          >
            Email
          </button>
          <button
            className={`${styles.tabBtn} ${
              activeTab === "phone" ? styles.activeTab : ""
            }`}
            onClick={() => {
              setActiveTab("phone");
              setError("");
            }}
          >
            Phone (OTP)
          </button>
        </div>

        {/* Notifications */}
        {error && <div className={styles.errorMsg}>{error}</div>}
        {info && <div className={styles.successMsg}>{info}</div>}

        {/* Social Auth Tab */}
        {activeTab === "social" && (
          <div className={styles.buttonStack}>
            <button
              className={`${styles.socialButton}`}
              onClick={() => handleSocialLogin("google")}
              disabled={loading}
            >
              <svg className={styles.icon} viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.3-.7-.5-1.5-.5-2.3z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                />
              </svg>
              Continue with Google
            </button>

            <button
              className={`${styles.socialButton}`}
              onClick={() => handleSocialLogin("github")}
              disabled={loading}
            >
              <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              Continue with GitHub
            </button>
          </div>
        )}

        {/* Email/Password Auth Tab */}
        {activeTab === "email" && (
          <form className={styles.form} onSubmit={handleEmailAuth}>
            {isSignUp && (
              <div className={styles.inputGroup}>
                <label className={styles.label}>Display Name</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className={styles.inputGroup}>
              <label className={styles.label}>Email Address</label>
              <input
                type="email"
                className={styles.input}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Password</label>
              <input
                type="password"
                className={styles.input}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading
                ? "Processing..."
                : isSignUp
                ? "Create Account"
                : "Sign In with Email"}
            </button>

            <div className={styles.toggleText}>
              {isSignUp ? "Already have an account?" : "Need an account?"}
              <button
                type="button"
                className={styles.toggleBtn}
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? "Log In" : "Sign Up"}
              </button>
            </div>
          </form>
        )}

        {/* Phone OTP Auth Tab */}
        {activeTab === "phone" && (
          <div>
            <div id="recaptcha-container" ref={recaptchaContainerRef} />

            {!otpSent ? (
              <form className={styles.form} onSubmit={handleSendPhoneOtp}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Phone Number (with Country Code)</label>
                  <input
                    type="tel"
                    className={styles.input}
                    placeholder="+1 234 567 8900 or +91 9876543210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? "Sending Code..." : "Send Verification Code"}
                </button>
              </form>
            ) : (
              <form className={styles.form} onSubmit={handleVerifyOtp}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Enter 6-Digit OTP Code</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? "Verifying..." : "Verify & Sign In"}
                </button>

                <div className={styles.toggleText}>
                  Didn&apos;t receive code?
                  <button
                    type="button"
                    className={styles.toggleBtn}
                    onClick={() => {
                      setOtpSent(false);
                      setOtpCode("");
                    }}
                  >
                    Resend
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;

"use client";
import Link from "next/link";
import styles from "./authLinks.module.css";
import { useState } from "react";
import { signOut, useSession } from "@/context/AuthContext";

const AuthLinks = () => {
  const [open, setOpen] = useState(false);
  const { status, data: sessionData } = useSession();

  const userInitial = (sessionData?.user?.name || sessionData?.user?.email || "U")[0].toUpperCase();

  return (
    <>
      {status === "unauthenticated" ? (
        <Link href="/login" className={styles.loginBtn}>
          Log In
        </Link>
      ) : (
        <div className={styles.userContainer}>
          <Link href="/write" className={styles.writeBtn}>
            <span className={styles.plusIcon}>+</span> Create Post
          </Link>

          <Link href="/profile" className={styles.profileBtn}>
            {sessionData?.user?.image ? (
              <img
                src={sessionData.user.image}
                alt="Profile"
                style={{ width: 24, height: 24, borderRadius: "50%" }}
              />
            ) : (
              <span className={styles.avatarBadge}>{userInitial}</span>
            )}
            <span>Profile</span>
          </Link>

          <button onClick={() => signOut()} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      )}
      <div className={styles.burger} onClick={() => setOpen(!open)}>
        <div className={styles.line}></div>
        <div className={styles.line}></div>
        <div className={styles.line}></div>
      </div>
      {open && (
        <div className={styles.responsiveMenu}>
          <Link href="/" onClick={() => setOpen(false)}>Home</Link>
          {status === "authenticated" && (
            <>
              <Link href="/profile" onClick={() => setOpen(false)}>👤 Profile</Link>
              <Link href="/write" onClick={() => setOpen(false)}>+ Create Post</Link>
            </>
          )}
          {status === "unauthenticated" ? (
            <Link href="/login" onClick={() => setOpen(false)}>Log In</Link>
          ) : (
            <span
              className={styles.link}
              onClick={() => {
                setOpen(false);
                signOut();
              }}
            >
              Logout
            </span>
          )}
        </div>
      )}
    </>
  );
};

export default AuthLinks;

"use client";
import Link from "next/link";
import styles from "./authLinks.module.css";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";

const AuthLinks = () => {
  const [open, setOpen] = useState(false);
  const { status, data: sessionData } = useSession();

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
            <Link href="/write" onClick={() => setOpen(false)}>+ Create Post</Link>
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

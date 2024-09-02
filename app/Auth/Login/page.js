"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import styles from "@/styles/Auth.module.css";

export default function Auth() {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });
      if (error) throw error;
      router.push("/");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/");
      router.refresh();
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div
        className={`${styles.authContainerWrapper} ${
          isRightPanelActive ? styles.rightPanelActive : ""
        }`}
      >
        <div className={`${styles.formContainer} ${styles.signUpContainer}`}>
          <form className={styles.authForm} onSubmit={handleSignUp}>
            <h1 className={styles.authTitle}>Create Account</h1>
            <div className={styles.socialContainer}>
              <a href="#" className={styles.socialLink}>
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className={styles.socialLink}>
                <i className="fab fa-google-plus-g"></i>
              </a>
              <a href="#" className={styles.socialLink}>
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
            <span className={styles.authSmallText}>
              or use your email for registration
            </span>
            <input
              type="text"
              placeholder="Name"
              className={styles.authInput}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              className={styles.authInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className={styles.authInput}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className={styles.authButton}>Sign Up</button>
          </form>
        </div>
        <div className={`${styles.formContainer} ${styles.signInContainer}`}>
          <form className={styles.authForm} onSubmit={handleSignIn}>
            <h1 className={styles.authTitle}>Sign in</h1>
            <div className={styles.socialContainer}>
              <a href="#" className={styles.socialLink}>
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className={styles.socialLink}>
                <i className="fab fa-google-plus-g"></i>
              </a>
              <a href="#" className={styles.socialLink}>
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
            <span className={styles.authSmallText}>or use your account</span>
            <input
              type="email"
              placeholder="Email"
              className={styles.authInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className={styles.authInput}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <a href="#" className={styles.authLink}>
              Forgot your password?
            </a>
            <button className={styles.authButton}>Sign In</button>
          </form>
        </div>
        <div className={styles.overlayContainer}>
          <div className={styles.overlay}>
            <div className={`${styles.overlayPanel} ${styles.overlayLeft}`}>
              <h1 className={styles.authTitle}>Welcome Back!</h1>
              <p className={styles.authText}>
                To keep connected with us please login with your personal info
              </p>
              <button
                className={`${styles.authButton} ${styles.authButtonGhost}`}
                onClick={() => setIsRightPanelActive(false)}
              >
                Sign In
              </button>
            </div>
            <div className={`${styles.overlayPanel} ${styles.overlayRight}`}>
              <h1 className={styles.authTitle}>Hello, Friend!</h1>
              <p className={styles.authText}>
                Enter your personal details and start journey with us
              </p>
              <button
                className={`${styles.authButton} ${styles.authButtonGhost}`}
                onClick={() => setIsRightPanelActive(true)}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
      {error && <p className={styles.authText}>{error}</p>}
    </div>
  );
}

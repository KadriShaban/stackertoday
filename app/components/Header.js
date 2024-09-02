"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Cookies from "js-cookie"; // Import js-cookie for cookie handling
import styles from "./header.module.css";
import { FaUser } from "react-icons/fa"; // Removed unused imports
import AuthModal from "./AuthModal.js";
import Search from "./Search"; // Make sure the path is correct

const Header = ({ onProfileClick }) => {
  const [session, setSession] = useState(null);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signin");

  const openModal = (mode) => {
    setAuthMode(mode);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      // Set cookie based on session
      Cookies.set("userLoggedIn", session ? "true" : "false");
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // Update cookie on auth state change
      Cookies.set("userLoggedIn", session ? "true" : "false");
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      // Clear cookie on sign out
      Cookies.remove("userLoggedIn");
      router.refresh(); // Refresh to update the session state
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };

  return (
    <header className={styles.header}>
      <div>
        <img
          className={styles.routeName}
          src="https://i.postimg.cc/SNwLkBvs/Invincidot-3.png"
          alt="Invincidot Logo"
        />
      </div>
      <div className={styles.linksContainer}>
        <div className={styles.searchContainer}>
          <Search /> {/* Integrated Search Component Here */}
          {session ? (
            <>
              <button className={styles.iconButton} onClick={onProfileClick}>
                <FaUser size="18px" />
              </button>
              <button className={styles.hover2} onClick={handleSignOut}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                className={styles.hover2}
                onClick={() => openModal("signin")}
              >
                Sign In
              </button>
              <button
                className={styles.glowingButton}
                onClick={() => openModal("signup")}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
      {isModalOpen && <AuthModal onClose={closeModal} mode={authMode} />}
    </header>
  );
};

export default Header;

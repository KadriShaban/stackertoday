"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import styles from "./ViewUserProfile.module.css";

const ViewUserProfile = ({ userId }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [supabase, userId]);

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (!profile) {
    return <div>Error loading profile</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <img
          src={profile.avatar_url || "/default-avatar.png"}
          alt="Profile"
          className={styles.profileImage}
        />
        <div className={styles.profileInfo}>
          <h2 className={styles.profileName}>
            {profile.display_name || "User"}
          </h2>
        </div>
      </div>

      <p className={styles.profileDescription}>
        {profile.description || "No description available"}
      </p>

      <p className={styles.profileFollowers}>
        <span className={styles.followerCount}>{profile.followers || "0"}</span>{" "}
        followers ·
        <a href={profile.website || "#"} className={styles.websiteLink}>
          {profile.website || "No website available"}
        </a>
      </p>

      <div className={styles.tabsContainer}>
        <button className={`${styles.tabButton} ${styles.activeTab}`}>
          Stacks
        </button>
        <button className={styles.tabButton}>Comments</button>
      </div>
    </div>
  );
};

export default ViewUserProfile;

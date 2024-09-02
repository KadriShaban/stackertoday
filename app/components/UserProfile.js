"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import styles from "./UserProfile.module.css";
import { useRouter } from "next/navigation";
import ProfileEditModal from "./ProfileEditModal"; // Import the ProfileEditModal component

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false); // State to manage modal visibility
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;

        setUser(user);

        if (user) {
          const { data, error } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          if (error) {
            if (error.code === "PGRST116") {
              // Profile doesn't exist, create a new one
              const { data: newProfile, error: createError } = await supabase
                .from("user_profiles")
                .insert([
                  {
                    id: user.id,
                    display_name: user.user_metadata.full_name || "New User",
                    bio: "",
                    followers: 0,
                    website: "",
                    created_at: new Date().toISOString(),
                  },
                ])
                .select()
                .single();
              if (createError) throw createError;
              setProfile(newProfile);
            } else {
              throw error;
            }
          } else {
            setProfile(data);
          }
        }
      } catch (error) {
        console.error("Error fetching/creating profile:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndProfile();
  }, [supabase]);

  const handleEditProfile = () => {
    if (user) {
      setEditModalOpen(true); // Open the modal
    } else {
      router.push("/login");
    }
  };

  const handleCloseModal = () => {
    setEditModalOpen(false); // Close the modal
  };

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile); // Update profile state with the new data
    handleCloseModal(); // Close the modal after updating
  };

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
            {profile.display_name || "Stellar Warfare"}
          </h2>
        </div>
      </div>
      <p className={styles.profileDescription}>
        {profile.bio ||
          "Ultimate Space RTS: Build, Customize, Conquer! 200+ Ships, Weapons, and Modules. Design Your Fleet. Single/Multiplayer/Co-op. Account by Kaizing"}
      </p>
      <p className={styles.profileFollowers}>
        <span className={styles.followerCount}>
          {profile.followers || "43"}
        </span>{" "}
        followers ·
        <a
          href={
            profile.website ||
            "https://store.steampowered.com/app/1113030/Stellar_Warfare"
          }
          className={styles.websiteLink}
        >
          {profile.website ||
            "store.steampowered.com/app/1113030/Stellar_Warfare"}
        </a>
      </p>
      <button className={styles.editProfileButton} onClick={handleEditProfile}>
        {user ? "Edit profile" : "Login to edit profile"}
      </button>
      <div className={styles.tabsContainer}>
        <button className={`${styles.tabButton} ${styles.activeTab}`}>
          Threads
        </button>
        <button className={styles.tabButton}>Replies</button>
        <button className={styles.tabButton}>Reposts</button>
      </div>

      {/* Include the ProfileEditModal */}
      {isEditModalOpen && (
        <ProfileEditModal
          profile={profile}
          isOpen={isEditModalOpen}
          onClose={handleCloseModal}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
};

export default UserProfile;

"use client";

import React, { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Lock } from "lucide-react";
import styles from "./ProfileEditModal.module.css";

const ProfileEditModal = ({ profile, isOpen, onClose, onProfileUpdate }) => {
  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [website, setWebsite] = useState(profile.website || "");
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .update({
          display_name: displayName,
          bio: bio,
          website: website,
        })
        .eq("id", profile.id)
        .single();

      if (error) throw error;

      onProfileUpdate(data); // Trigger profile update in page.js
    } catch (error) {
      console.error("Error updating profile:", error.message);
      alert("Failed to update profile, please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.sectionTitle}>Name</h2>
        <div className={styles.inputWrapper}>
          <Lock className={styles.lockIcon} size={16} />
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={styles.input}
            placeholder="Stellar Warfare (@stellar.warfare)"
          />
        </div>
        <h2 className={styles.sectionTitle}>Bio</h2>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className={styles.textarea}
          rows="4"
          placeholder="Ultimate Space RTS: Build, Customize, Conquer! 200+ Ships, Weapons, and Modules. Design Your Fleet. Single/Multiplayer/Co-op. Account by Kaizing"
        ></textarea>
        <h2 className={styles.sectionTitle}>Link</h2>
        <input
          type="text"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className={styles.input}
          placeholder="https://store.steampowered.com/app/1113030/Stellar_Warfare/"
        />
        <div className={styles.footer}>
          <button
            onClick={handleSave}
            className={styles.saveButton}
            disabled={loading}
          >
            {loading ? "Saving..." : "Done"}
          </button>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;

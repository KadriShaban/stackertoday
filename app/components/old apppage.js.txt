"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import styles from "./page.module.css";
import Header from "./components/Header";
import PostContainer from "./components/PostContainer";
import NewPostForm from "./components/NewPostForm";
import NotificationComponent from "./components/NotificationComponent";
import UserProfile from "./components/UserProfile";
import ProfileEditModal from "./components/ProfileEditModal";
import Sidebar from "./components/Sidebar";

export default function Home() {
  const [activeComponent, setActiveComponent] = useState("postContainer");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = Cookies.get("userLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
  }, []);

  const handleMenuClick = (componentName) => {
    setActiveComponent(componentName);
  };

  const handleProfileClick = () => {
    setActiveComponent("userProfile");
  };

  const handleEditProfile = (profileData) => {
    setProfile(profileData);
    setIsEditModalOpen(true);
  };

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
    setIsEditModalOpen(false);
    setActiveComponent("userProfile");
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setActiveComponent("userProfile");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    Cookies.remove("userLoggedIn");
    setActiveComponent("postContainer");
    alert("You have been logged out.");
  };

  return (
    <main className={styles.main}>
      <Sidebar onMenuClick={handleMenuClick} isLoggedIn={isLoggedIn} />
      <Header onProfileClick={handleProfileClick} isLoggedIn={isLoggedIn} />
      {activeComponent === "postContainer" && <PostContainer />}
      {activeComponent === "newPostForm" && <NewPostForm />}
      {activeComponent === "notification" && <NotificationComponent />}
      {activeComponent === "userProfile" && (
        <UserProfile onEditProfile={handleEditProfile} />
      )}
      {isEditModalOpen && (
        <ProfileEditModal
          profile={profile}
          isOpen={isEditModalOpen}
          onClose={handleCloseModal}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
    </main>
  );
}

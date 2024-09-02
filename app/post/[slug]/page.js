"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie"; // Import Cookies from js-cookie
import { useRouter } from "next/navigation"; // Import useRouter hook from next/navigation
import { supabase } from "@/lib/supabase";
import PostCard from "@/app/components/PostCard";
import styles from "./slugpage.module.css";
import CommentList from "@/app/components/CommentList";
import AddComment from "@/app/components/AddComment";
import { DiscussionEmbed } from "disqus-react";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import NewPostForm from "@/app/components/NewPostForm";
import NotificationComponent from "@/app/components/NotificationComponent";
import UserProfile from "@/app/components/UserProfile";
import ProfileEditModal from "@/app/components/ProfileEditModal";

const PostPage = ({ params }) => {
  const { slug } = params;
  const postId = slug.split("-").pop(); // Extract postId from slug
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchCommentsFlag, setFetchCommentsFlag] = useState(false);
  const [activeComponent, setActiveComponent] = useState("postDetail");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter(); // Initialize the useRouter hook

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", postId)
        .single();

      if (error) {
        console.error("Error fetching post:", error);
      } else {
        setPost(data);
      }
      setLoading(false);
    };

    fetchPost();
  }, [postId]);

  useEffect(() => {
    const loggedIn = Cookies.get("userLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
  }, []);

  const handleCommentAdded = () => {
    setFetchCommentsFlag(!fetchCommentsFlag);
  };

  const handleMenuClick = (componentName) => {
    setActiveComponent(componentName);
    if (componentName !== "postDetail") {
      router.push("/"); // Navigate to the home URL when a different component is clicked
    }
  };

  const handleProfileClick = () => {
    setActiveComponent("userProfile");
    router.push("/"); // Reset URL to home when profile is clicked
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
    setActiveComponent("postDetail");
    alert("You have been logged out.");
  };

  if (loading) return <p>Loading...</p>;
  if (!post) return <p>Post not found.</p>;

  return (
    <div className="totalpage">
      <Sidebar onMenuClick={handleMenuClick} isLoggedIn={isLoggedIn} />
      <Header onProfileClick={handleProfileClick} isLoggedIn={isLoggedIn} />
      <div className={styles.slugPageContainer}>
        {activeComponent === "postDetail" && (
          <>
            <PostCard post={post} />
            <CommentList postId={postId} refresh={fetchCommentsFlag} />
          </>
        )}
      </div>
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
    </div>
  );
};

export default PostPage;

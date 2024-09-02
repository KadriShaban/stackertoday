import React, { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Cookies from "js-cookie";
import styles from "./AddComment.module.css";

const AddComment = ({ postId, onCommentAdded }) => {
  const [content, setContent] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const loggedIn = Cookies.get("userLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (content.trim()) {
      let userId = null;
      let userName = "Anonymous";

      if (isLoggedIn) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          userId = user.id;
          userName = user.user_metadata?.full_name || "User";
        }
      }

      const { data, error } = await supabase
        .from("comments")
        .insert([
          {
            post_id: postId,
            user_id: userId,
            content,
          },
        ])
        .select();

      if (error) {
        console.error("Error submitting comment:", error);
      } else {
        console.log("Comment submitted successfully:", data);
        setContent("");
        onCommentAdded();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.addCommentForm}>
      <div className={styles.inputWrapper}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          className={styles.textarea}
        />
      </div>
      <div className={styles.buttonWrapper}>
        <button type="submit" className={styles.button}>
          Submit
        </button>
      </div>
    </form>
  );
};

export default AddComment;

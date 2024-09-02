import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Globe, Clock, User, FileText, MessageSquare } from "lucide-react";
import styles from "./postcard.module.css";
import {
  ThumbUp,
  ThumbUpOutlined,
  ThumbDown,
  ThumbDownOutlined,
} from "@mui/icons-material";
import CircularProgress from "@mui/material/CircularProgress"; // Corrected import for CircularProgress
import Box from "@mui/material/Box"; // Corrected import for Box

const PostCard = ({ post }) => {
  const [votes, setVotes] = useState(post.votes);
  const [userVote, setUserVote] = useState(null);
  const [commentCount, setCommentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const router = useRouter();

  useEffect(() => {
    const storedVote = JSON.parse(localStorage.getItem(`userVote-${post.id}`));
    setUserVote(storedVote);

    // Fetch the total number of comments for this post
    async function fetchCommentCount() {
      try {
        const res = await fetch(`/api/comments/${post.id}`);
        const data = await res.json();
        setCommentCount(data.count || 0);
      } catch (error) {
        console.error("Failed to fetch comment count:", error);
      }
    }

    fetchCommentCount();
  }, [post.id]);

  const handleVote = async (voteType) => {
    const newVote = userVote === voteType ? 0 : voteType;
    const newVotes = votes + (newVote - (userVote || 0));

    setVotes(newVotes);
    setUserVote(newVote);

    try {
      const response = await fetch("/api/updatePostVote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId: post.id, votes: newVotes }),
      });

      if (!response.ok) {
        throw new Error("Failed to update votes");
      }

      localStorage.setItem(`userVote-${post.id}`, JSON.stringify(newVote));
    } catch (error) {
      console.error("Error updating votes:", error);
      setVotes(votes - (newVote - (userVote || 0)));
      setUserVote(userVote);
    }
  };

  const generateSlug = (title, id) => {
    return `${title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")}-${id}`;
  };

  const handleTitleClick = (e) => {
    e.preventDefault();
    setIsLoading(true); // Set loading state to true when navigating
    const slug = generateSlug(post.title, post.id);
    router.push(`/post/${slug}`);
  };

  return (
    <div className={styles.postCardWrapper}>
      <div className={styles.animatedBorder}></div>
      <div className={styles.postCard}>
        {isLoading ? ( // Show spinner when loading
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="125px"
          >
            <CircularProgress
              style={{
                color: "Black",
              }}
            />
          </Box> // Correctly closed Box element
        ) : (
          <>
            <div className={styles.voteContainer}>
              <button
                onClick={() => handleVote(1)}
                className={styles.voteButton}
              >
                {userVote === 1 ? (
                  <ThumbUp style={{ color: "Green" }} />
                ) : (
                  <ThumbUpOutlined />
                )}
              </button>
              <span className={styles.voteCount}>{votes}</span>
              <button
                onClick={() => handleVote(-1)}
                className={styles.voteButton}
              >
                {userVote === -1 ? (
                  <ThumbDown style={{ color: "Red" }} />
                ) : (
                  <ThumbDownOutlined />
                )}
              </button>
            </div>
            <div className={styles.imageContainer}>
              <img
                src={post.image_url || "/api/placeholder/300/200"}
                alt="Post image"
                className={styles.image}
              />
            </div>
            <div className={styles.contentContainer}>
              <span className={styles.metaItem}>
                <User size={16} className={styles.metaIcon} />{" "}
                {post.displayuser}
              </span>
              <h2
                className={styles.title}
                onClick={handleTitleClick}
                style={{ cursor: "pointer" }}
              >
                {post.title}
              </h2>
              <div className={styles.metaInfo}>
                <div className={styles.linkContainer}>
                  {post.domain ? (
                    <>
                      <Globe size={16} className={styles.linkIcon} />
                      <a
                        href={post.link}
                        className={styles.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {post.domain}
                      </a>
                    </>
                  ) : (
                    <span className={styles.linkPlaceholder}></span>
                  )}
                </div>
                <span className={styles.metaItem}>
                  <Clock size={16} className={styles.metaIcon} />{" "}
                  {new Date(post.timing).toUTCString()}
                </span>
                <span className={styles.metaItem}>
                  <FileText size={16} className={styles.metaIcon} />{" "}
                  {post.read_time} min read
                </span>
              </div>
              <div className={styles.commentInfo}>
                <MessageSquare size={16} className={styles.commentIcon} />
                <span>{commentCount} comments</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PostCard;

"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  TextField,
} from "@mui/material";
import { ThumbUp, ThumbDown } from "@mui/icons-material";
import AddComment from "./AddComment";
import styles from "./CommentList.module.css";

export default function CommentList({ postId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  async function fetchComments() {
    try {
      const { data: comments, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setComments(comments);

      const storedVotes = JSON.parse(localStorage.getItem("userVotes")) || {};
      setUserVotes(storedVotes);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setError("Failed to load comments. Please try again later.");
      setLoading(false);
    }
  }

  const handleVote = async (commentId, voteType) => {
    try {
      const updatedUserVotes = { ...userVotes };
      const comment = comments.find((c) => c.id === commentId);

      if (!comment) return;

      let newUpvoteCount = comment.upvote;
      let newDownvoteCount = comment.downvote;

      if (userVotes[commentId] === voteType) {
        if (voteType === 1) newUpvoteCount -= 1;
        else newDownvoteCount -= 1;
        delete updatedUserVotes[commentId];
      } else {
        if (voteType === 1) {
          newUpvoteCount += 1;
          if (userVotes[commentId] === -1) newDownvoteCount -= 1;
        } else {
          newDownvoteCount += 1;
          if (userVotes[commentId] === 1) newUpvoteCount -= 1;
        }
        updatedUserVotes[commentId] = voteType;
      }

      setComments((prevComments) =>
        prevComments.map((c) =>
          c.id === commentId
            ? { ...c, upvote: newUpvoteCount, downvote: newDownvoteCount }
            : c
        )
      );

      await supabase
        .from("comments")
        .update({ upvote: newUpvoteCount, downvote: newDownvoteCount })
        .eq("id", commentId);

      localStorage.setItem("userVotes", JSON.stringify(updatedUserVotes));
      setUserVotes(updatedUserVotes);
    } catch (error) {
      console.error("Error updating votes:", error);
      setError("Failed to update vote. Please try again.");
    }
  };

  const handleReply = async (parentId) => {
    if (replyContent.trim() === "") return;

    try {
      const { data, error } = await supabase
        .from("comments")
        .insert([
          { content: replyContent, post_id: postId, parent_id: parentId },
        ])
        .select();

      if (error) throw error;

      setComments((prevComments) => [...prevComments, ...data]);
      setReplyContent("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Error adding reply:", error);
      setError("Failed to add reply. Please try again.");
    }
  };

  const renderComments = (parentId = null, depth = 0) => {
    return comments
      .filter((comment) => comment && comment.parent_id === parentId)
      .map((comment) => (
        <Box
          key={comment.id}
          className={`${styles.commentBox} ${styles[`depth${depth}`]}`}
        >
          <div className={styles.commentMeta}>
            <span className={styles.commentAuthor}>
              {comment.display_name || "Anonymous"}
            </span>
            <span className={styles.commentDate}>
              {new Date(comment.created_at).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <Typography variant="body1">{comment.content}</Typography>
          <div className={styles.voteContainer}>
            <button
              className={`${styles.voteButton} ${styles.upvote} ${
                userVotes[comment.id] === 1 ? styles.active : ""
              }`}
              onClick={() => handleVote(comment.id, 1)}
            >
              <ThumbUp />
            </button>
            <span className={styles.voteCount}>{comment.upvote}</span>
            <button
              className={`${styles.voteButton} ${styles.downvote} ${
                userVotes[comment.id] === -1 ? styles.active : ""
              }`}
              onClick={() => handleVote(comment.id, -1)}
            >
              <ThumbDown />
            </button>
            <span className={styles.voteCount}>{comment.downvote}</span>
            <button
              className={styles.replyButton}
              onClick={() => setReplyingTo(comment.id)}
            >
              Reply
            </button>
          </div>
          {replyingTo === comment.id && (
            <Box className={styles.replyForm}>
              <TextField
                multiline
                rows={3}
                placeholder="Write your reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                fullWidth
                variant="standard"
                className={styles.replyTextArea}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleReply(comment.id)}
                className={styles.submitReply}
              >
                Submit Reply
              </Button>
            </Box>
          )}
          <Box className={styles.replies}>
            {renderComments(comment.id, depth + 1)}
          </Box>
        </Box>
      ));
  };

  const handleCommentAdded = async () => {
    await fetchComments();
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="commentList">
      <Typography variant="h5">Comments</Typography>
      {error && <div className="errorMessage">{error}</div>}
      <AddComment postId={postId} onCommentAdded={handleCommentAdded} />
      {comments.length === 0 ? (
        <Typography>No comments yet. Be the first to comment!</Typography>
      ) : (
        renderComments()
      )}
    </Box>
  );
}

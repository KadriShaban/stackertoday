"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Button,
} from "@mui/material";
import {
  ThumbUp,
  ThumbUpOutlined,
  ThumbDown,
  ThumbDownOutlined,
} from "@mui/icons-material";
import AddComment from "./AddComment";

export default function CommentList({ postId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState({});

  useEffect(() => {
    async function fetchComments() {
      const { data: comments, error } = await supabase
        .from("comments")
        .select("*, user_profiles(username)")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error(error);
        return;
      }

      setComments(comments);

      const storedVotes = JSON.parse(localStorage.getItem("userVotes")) || {};
      setUserVotes(storedVotes);

      setLoading(false);
    }

    fetchComments();
  }, [postId]);

  const handleVote = async (commentId, voteType) => {
    try {
      const updatedUserVotes = { ...userVotes };
      const comment = comments.find((c) => c.id === commentId);

      if (!comment) return;

      let newUpvoteCount = comment.upvote;
      let newDownvoteCount = comment.downvote;

      if (userVotes[commentId] === voteType) {
        if (voteType === 1) {
          newUpvoteCount -= 1;
        } else {
          newDownvoteCount -= 1;
        }
        delete updatedUserVotes[commentId];
      } else {
        if (voteType === 1) {
          newUpvoteCount += 1;
          if (userVotes[commentId] === -1) {
            newDownvoteCount -= 1;
          }
        } else {
          newDownvoteCount += 1;
          if (userVotes[commentId] === 1) {
            newUpvoteCount -= 1;
          }
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
    }
  };

  const handleReplyChange = (commentId, value) => {
    setReplyContent((prev) => ({
      ...prev,
      [commentId]: value,
    }));
  };

  const handleReplySubmit = async (parentId) => {
    const content = replyContent[parentId];
    if (!content) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("comments").insert({
      content,
      post_id: postId,
      parent_id: parentId,
      user_id: user.id,
    });

    if (error) {
      console.error("Error submitting reply:", error);
      return;
    }

    setReplyContent((prev) => ({
      ...prev,
      [parentId]: "",
    }));

    refreshComments();
  };

  const refreshComments = async () => {
    const { data: comments, error } = await supabase
      .from("comments")
      .select("*, user_profiles(username)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setComments(comments);
  };

  const renderComments = (parentId = null) => {
    return comments
      .filter((comment) => comment && comment.parent_id === parentId)
      .map((comment) => (
        <Box
          key={comment.id}
          sx={{
            borderBottom: parentId ? "none" : "1px solid #ddd",
            padding: parentId ? "10px 0 10px 20px" : "10px 0",
            marginLeft: parentId ? "20px" : "0",
          }}
        >
          {/* Comment content */}
          <Typography variant="body1" style={{ marginBottom: "0.5rem" }}>
            {comment.content}
          </Typography>
          {/* Display username */}
          <Typography variant="body2" color="textSecondary">
            {comment.user_profiles.username || "Unknown User"}
          </Typography>
          {/* Vote and reply buttons */}
          <Box display="flex" alignItems="center">
            <IconButton
              onClick={() => handleVote(comment.id, 1)}
              color={userVotes[comment.id] === 1 ? "primary" : "default"}
            >
              {userVotes[comment.id] === 1 ? <ThumbUp /> : <ThumbUpOutlined />}
            </IconButton>
            <Typography variant="caption" style={{ marginRight: "15px" }}>
              {comment.upvote} upvotes
            </Typography>
            <IconButton
              onClick={() => handleVote(comment.id, -1)}
              color={userVotes[comment.id] === -1 ? "secondary" : "default"}
            >
              {userVotes[comment.id] === -1 ? (
                <ThumbDown />
              ) : (
                <ThumbDownOutlined />
              )}
            </IconButton>
            <Typography variant="caption">
              {comment.downvote} downvotes
            </Typography>
            <Button
              variant="text"
              onClick={() => setReplyingTo(comment.id)}
              style={{ marginLeft: "auto" }}
            >
              Reply
            </Button>
          </Box>
          {/* Reply form */}
          {replyingTo === comment.id && (
            <Box mt={2}>
              <textarea
                rows="3"
                placeholder="Write your reply..."
                value={replyContent[comment.id] || ""}
                onChange={(e) => handleReplyChange(comment.id, e.target.value)}
                style={{ width: "100%", padding: "10px" }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleReplySubmit(comment.id)}
                style={{ marginTop: "10px" }}
              >
                Submit Reply
              </Button>
            </Box>
          )}
          {/* Recursive render for nested comments */}
          {renderComments(comment.id)}
        </Box>
      ));
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress color="inherit" style={{ color: "black" }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Add Comment Form */}
      <AddComment postId={postId} onCommentAdded={refreshComments} />
      {/* Render Comments */}
      {renderComments()}
    </Box>
  );
}

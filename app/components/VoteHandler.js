// components/VoteHandler.js
"use client";
import { useState } from "react";
import { IconButton, Typography } from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";

const VoteHandler = ({ comment, userVotes, handleVote }) => {
  const [upvotes, setUpvotes] = useState(comment.upvotes || 0);
  const [downvotes, setDownvotes] = useState(comment.downvotes || 0);

  const handleUpvote = () => {
    handleVote(comment.id, "upvote");
    setUpvotes((prev) => prev + 1);
  };

  const handleDownvote = () => {
    handleVote(comment.id, "downvote");
    setDownvotes((prev) => prev + 1);
  };

  return (
    <div
      style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}
    >
      <IconButton onClick={handleUpvote} color="primary">
        <ThumbUpIcon />
      </IconButton>
      <Typography variant="body2">{upvotes}</Typography>
      <IconButton onClick={handleDownvote} color="secondary">
        <ThumbDownIcon />
      </IconButton>
      <Typography variant="body2">{downvotes}</Typography>
    </div>
  );
};

export default VoteHandler;

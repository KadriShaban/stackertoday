"use client";

import React, { useState } from "react";
import { User, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";

// Component to render a single comment and its replies
const Comment = ({ comment, onReply }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  return (
    <div className="comment">
      <div className="comment-header">
        <User size={16} />
        <span>{comment.user.name}</span>
      </div>
      <p>{comment.content}</p>
      <button onClick={() => setIsReplying(!isReplying)}>
        {isReplying ? "Cancel" : "Reply"}
      </button>
      {isReplying && (
        <CommentForm
          onSubmit={(content) => {
            onReply(comment.id, content);
            setIsReplying(false);
          }}
        />
      )}
      {comment.replies?.length > 0 && (
        <button onClick={() => setShowReplies(!showReplies)}>
          {showReplies ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {comment.replies.length} replies
        </button>
      )}
      {showReplies &&
        comment.replies.map((reply) => (
          <Comment key={reply.id} comment={reply} onReply={onReply} />
        ))}
    </div>
  );
};

// Component to render the comment form
const CommentForm = ({ onSubmit }) => {
  const [content, setContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(content);
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a reply..."
      />
      <button type="submit">Submit</button>
    </form>
  );
};

// Component to render the list of comments
const CommentList = ({ comments, onReply }) => {
  return (
    <div className="comments-list">
      {comments.map((comment) => (
        <Comment key={comment.id} comment={comment} onReply={onReply} />
      ))}
    </div>
  );
};

// Example usage of the CommentList component
const ExampleCommentSection = ({ postId }) => {
  const [comments, setComments] = useState([
    // Example comments structure
    {
      id: 1,
      content: "This is a comment",
      user: { name: "User 1" },
      replies: [
        {
          id: 2,
          content: "This is a reply",
          user: { name: "User 2" },
          replies: [],
        },
      ],
    },
  ]);

  const handleReply = (parentId, content) => {
    // Logic to add a reply to the correct comment in the comments array
    const addReply = (comments) =>
      comments.map((comment) => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [
              ...comment.replies,
              {
                id: Math.random(),
                content,
                user: { name: "Current User" },
                replies: [],
              },
            ],
          };
        } else if (comment.replies.length > 0) {
          return { ...comment, replies: addReply(comment.replies) };
        } else {
          return comment;
        }
      });

    setComments(addReply(comments));
  };

  return (
    <div className="example-comment-section">
      <h3>
        <MessageSquare size={20} /> Comments
      </h3>
      <CommentList comments={comments} onReply={handleReply} />
    </div>
  );
};

export default ExampleCommentSection;

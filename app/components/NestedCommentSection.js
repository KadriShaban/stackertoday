import React, { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Cookies from "js-cookie";

// Comment Component
const Comment = ({ comment, onReply, depth = 0 }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(depth === 0);

  return (
    <div className="comment" style={{ marginLeft: `${depth * 20}px` }}>
      <div className="comment-header">
        <span className="user-name">{comment.user?.name || "Anonymous"}</span>
      </div>
      <p className="comment-content">{comment.content}</p>
      <button onClick={() => setIsReplying(!isReplying)}>
        {isReplying ? "Cancel" : "Reply"}
      </button>
      {comment.replies?.length > 0 && (
        <button onClick={() => setShowReplies(!showReplies)}>
          {showReplies ? "Hide Replies" : "Show Replies"} (
          {comment.replies.length})
        </button>
      )}
      {isReplying && (
        <AddComment
          postId={comment.post_id}
          parentId={comment.id}
          onCommentAdded={() => {
            onReply();
            setIsReplying(false);
          }}
        />
      )}
      {showReplies &&
        comment.replies?.map((reply) => (
          <Comment
            key={reply.id}
            comment={reply}
            onReply={onReply}
            depth={depth + 1}
          />
        ))}
    </div>
  );
};

// AddComment Component
const AddComment = ({ postId, parentId = null, onCommentAdded }) => {
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
            parent_id: parentId,
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
    <form onSubmit={handleSubmit} className="add-comment-form">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
      />
      <button type="submit">Submit Comment</button>
    </form>
  );
};

// CommentList Component
const CommentList = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select(
        `
        id,
        content,
        created_at,
        user_id,
        parent_id,
        post_id,
        user:users(name)
      `
      )
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
    } else {
      const nestedComments = nestComments(data);
      setComments(nestedComments);
    }
  };

  const nestComments = (comments) => {
    const commentMap = {};
    const roots = [];

    comments.forEach((comment) => {
      commentMap[comment.id] = { ...comment, replies: [] };
    });

    comments.forEach((comment) => {
      if (comment.parent_id) {
        commentMap[comment.parent_id].replies.push(commentMap[comment.id]);
      } else {
        roots.push(commentMap[comment.id]);
      }
    });

    return roots;
  };

  return (
    <div className="comment-list">
      <h3>Comments ({comments.length})</h3>
      {comments.map((comment) => (
        <Comment key={comment.id} comment={comment} onReply={fetchComments} />
      ))}
    </div>
  );
};

export { AddComment, CommentList };

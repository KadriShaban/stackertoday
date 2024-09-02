import React, { useState, useEffect } from "react";
import { User, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/lib/supabase";

const Comment = ({ comment, onReply, onDelete, currentUser }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  return (
    <div className="border-l-2 border-gray-200 pl-4 mb-4">
      <div className="flex items-center mb-2">
        <User size={16} className="mr-2" />
        <span className="font-semibold">
          {comment.user?.name || "Anonymous"}
        </span>
      </div>
      <p className="mb-2">{comment.content}</p>
      <div className="flex space-x-2">
        <button
          onClick={() => setIsReplying(!isReplying)}
          className="text-blue-500 hover:underline"
        >
          {isReplying ? "Cancel" : "Reply"}
        </button>
        {currentUser && comment.user_id === currentUser.id && (
          <button
            onClick={() => onDelete(comment.id)}
            className="text-red-500 hover:underline"
          >
            Delete
          </button>
        )}
      </div>
      {isReplying && (
        <CommentForm
          onSubmit={(content) => {
            onReply(comment.id, content);
            setIsReplying(false);
          }}
        />
      )}
      {comment.replies?.length > 0 && (
        <button
          onClick={() => setShowReplies(!showReplies)}
          className="flex items-center mt-2 text-gray-600"
        >
          {showReplies ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          <span className="ml-1">{comment.replies.length} replies</span>
        </button>
      )}
      {showReplies &&
        comment.replies?.map((reply) => (
          <Comment
            key={reply.id}
            comment={reply}
            onReply={onReply}
            onDelete={onDelete}
            currentUser={currentUser}
          />
        ))}
    </div>
  );
};

const CommentForm = ({ onSubmit }) => {
  const [content, setContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content);
      setContent("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
        className="w-full p-2 border rounded"
        rows="3"
      />
      <button
        type="submit"
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Submit
      </button>
    </form>
  );
};

const FunctionalCommentSection = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*, user:auth.users(name)")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching comments:", error);
      } else {
        const nestedComments = nestComments(data);
        setComments(nestedComments);
      }
    };

    const fetchCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);
    };

    fetchComments();
    fetchCurrentUser();
  }, [postId]);

  const nestComments = (comments) => {
    const commentMap = {};
    const rootComments = [];

    comments.forEach((comment) => {
      commentMap[comment.id] = { ...comment, replies: [] };
    });

    comments.forEach((comment) => {
      if (comment.parent_id) {
        commentMap[comment.parent_id].replies.push(commentMap[comment.id]);
      } else {
        rootComments.push(commentMap[comment.id]);
      }
    });

    return rootComments;
  };

  const handleReply = async (parentId, content) => {
    if (!currentUser) {
      alert("Please log in to comment.");
      return;
    }

    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: currentUser.id,
        parent_id: parentId,
        content: content,
      })
      .select("*, user:auth.users(name)")
      .single();

    if (error) {
      console.error("Error adding reply:", error);
    } else {
      setComments((prevComments) => {
        const updatedComments = [...prevComments];
        const addReplyToComment = (comments) => {
          for (let comment of comments) {
            if (comment.id === parentId) {
              comment.replies.push(data);
              return true;
            }
            if (comment.replies && addReplyToComment(comment.replies)) {
              return true;
            }
          }
          return false;
        };
        addReplyToComment(updatedComments);
        return updatedComments;
      });
    }
  };

  const handleDelete = async (commentId) => {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      console.error("Error deleting comment:", error);
    } else {
      setComments((prevComments) => {
        const deleteComment = (comments) => {
          return comments.filter((comment) => {
            if (comment.id === commentId) {
              return false;
            }
            if (comment.replies) {
              comment.replies = deleteComment(comment.replies);
            }
            return true;
          });
        };
        return deleteComment(prevComments);
      });
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <MessageSquare size={24} className="mr-2" /> Comments
      </h3>
      <CommentForm onSubmit={(content) => handleReply(null, content)} />
      <div className="mt-6">
        {comments.map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            onReply={handleReply}
            onDelete={handleDelete}
            currentUser={currentUser}
          />
        ))}
      </div>
    </div>
  );
};

export default FunctionalCommentSection;

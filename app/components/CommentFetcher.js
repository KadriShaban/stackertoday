// components/CommentFetcher.js
import { useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const CommentFetcher = ({ postId, setComments }) => {
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from("comments")
        .select(
          `
          id, content, created_at, parent_id,
          user_profiles ( username )
        `
        )
        .eq("post_id", postId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching comments:", error);
      } else {
        setComments(data);
      }
    };

    fetchComments();
  }, [postId, setComments]);

  return null;
};

export default CommentFetcher;

"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import PostCard from "@/app/components/PostCard";
import styles from "./slugpage.module.css";
import CommentList from "@/app/components/CommentList";
import AddComment from "@/app/components/AddComment";
import { DiscussionEmbed } from "disqus-react";
import { useRouter } from "next/router";

const PostDetailComponent = ({ initialSlug }) => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchCommentsFlag, setFetchCommentsFlag] = useState(false);

  const router = useRouter();
  const slug = router.query.slug || initialSlug;
  const postId = slug.split("-").pop(); // Extract postId from slug

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
        // Update the URL when the post is fetched
        router.push(`/posts/${slug}`);
      }
      setLoading(false);
    };

    if (postId) {
      fetchPost();
    }
  }, [postId, slug]);

  const handleCommentAdded = () => {
    setFetchCommentsFlag(!fetchCommentsFlag);
  };

  if (loading) return <p>Loading...</p>;
  if (!post) return <p>Post not found.</p>;

  return (
    <div className={styles.slugPageContainer}>
      <PostCard post={post} />
      <CommentList postId={postId} refresh={fetchCommentsFlag} />
      <AddComment postId={postId} onCommentAdded={handleCommentAdded} />
      <DiscussionEmbed
        shortname="stakertoday"
        config={{
          url: `http://localhost:3000/posts/${post.slug}`,
          identifier: post.id.toString(),
          title: post.title,
          language: "en",
        }}
      />
    </div>
  );
};

export default PostDetailComponent;

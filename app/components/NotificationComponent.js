"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import styles from "./postcontainer.module.css";
import Categories from "./Categories";

const PostCard = dynamic(() => import("./PostCard"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

const PostContainer = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("posts") // Ensure "posts" is your table name
        .select("*");

      if (error) {
        console.error("Error fetching posts:", error);
      } else {
        setPosts(data);
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Categories />
      <div className={styles.postContainer}>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </>
  );
};

export default PostContainer;

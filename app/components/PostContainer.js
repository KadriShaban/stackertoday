"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import styles from "./postcontainer.module.css";
import Categories from "./Categories";
import Pagination from "@mui/material/Pagination"; // Import MUI Pagination
import Box from "@mui/material/Box"; // Import Box for styling

const PostCard = dynamic(() => import("./PostCard"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

const POSTS_PER_PAGE = 5; // Set the number of posts per page

const PostContainer = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortType, setSortType] = useState("latest");
  const [timeFilter, setTimeFilter] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);

      let { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        console.error("Error fetching posts:", error);
      } else {
        setPosts(data);
        setFilteredPosts(data);
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    let filtered = [...posts];

    if (selectedCategory) {
      filtered = filtered.filter(
        (post) =>
          post.category &&
          post.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (timeFilter) {
      const now = new Date();
      const filterDate = new Date();
      if (timeFilter === "1h") filterDate.setHours(now.getHours() - 1);
      if (timeFilter === "6h") filterDate.setHours(now.getHours() - 6);
      if (timeFilter === "24h") filterDate.setDate(now.getDate() - 1);
      if (timeFilter === "7d") filterDate.setDate(now.getDate() - 7);

      filtered = filtered.filter((post) => new Date(post.timing) >= filterDate);
    }

    if (sortType === "top") {
      filtered.sort((a, b) => b.votes - a.votes);
    } else {
      filtered.sort((a, b) => new Date(b.timing) - new Date(a.timing));
    }

    setFilteredPosts(filtered);
  }, [selectedCategory, posts, sortType, timeFilter]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleSortChange = (type) => {
    setSortType(type);
    setCurrentPage(1);
  };

  const handleTimeFilterChange = (filter) => {
    setTimeFilter((prevFilter) => (prevFilter === filter ? null : filter));
    setCurrentPage(1);
  };

  const indexOfLastPost = currentPage * POSTS_PER_PAGE;
  const indexOfFirstPost = indexOfLastPost - POSTS_PER_PAGE;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Categories
        onCategorySelect={handleCategorySelect}
        selectedCategory={selectedCategory}
      />

      <div className={styles.sortbuttons}>
        <div className={styles.sortOptions}>
          <button
            className={sortType === "latest" ? styles.activeSortButton : ""}
            onClick={() => handleSortChange("latest")}
          >
            Latest
          </button>
          <button
            className={sortType === "top" ? styles.activeSortButton : ""}
            onClick={() => handleSortChange("top")}
          >
            Top
          </button>
        </div>
        <div className={styles.timeFilters}>
          <button
            className={timeFilter === "1h" ? styles.activeTimeButton : ""}
            onClick={() => handleTimeFilterChange("1h")}
          >
            1 Hour
          </button>
          <button
            className={timeFilter === "6h" ? styles.activeTimeButton : ""}
            onClick={() => handleTimeFilterChange("6h")}
          >
            6 Hours
          </button>
          <button
            className={timeFilter === "24h" ? styles.activeTimeButton : ""}
            onClick={() => handleTimeFilterChange("24h")}
          >
            24 Hours
          </button>
          <button
            className={timeFilter === "7d" ? styles.activeTimeButton : ""}
            onClick={() => handleTimeFilterChange("7d")}
          >
            7 Days
          </button>
        </div>
      </div>
      <div className={styles.postContainer}>
        {currentPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      <Box
        position="absolute"
        top="1125px"
        color="black"
        justifyContent="center"
        mt={4}
      >
        <Pagination
          count={Math.ceil(filteredPosts.length / POSTS_PER_PAGE)}
          page={currentPage}
          onChange={handlePageChange}
          sx={{
            "& .MuiPaginationItem-root": {
              color: "black",
            },
            "& .Mui-selected": {
              backgroundColor: "black",
              color: "white",
            },
            "& .MuiPaginationItem-ellipsis": {
              color: "black",
            },
            "& .MuiPaginationItem-icon": {
              color: "black",
            },
            "& .MuiPaginationItem-root:hover": {
              backgroundColor: "black",
              color: "white",
            },
          }}
        />
      </Box>
    </>
  );
};

export default PostContainer;

"use client";

import React, { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { TextField, Chip, Box, Typography, Container } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ClearIcon from "@mui/icons-material/Clear";
import styles from "@/app/components/NewPostForm.module.css";

const NewPostForm = () => {
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [link, setLink] = useState("");
  const [domain, setDomain] = useState("");
  const [readTime, setReadTime] = useState("");
  const [category, setCategory] = useState("");
  const [isCategoryLocked, setIsCategoryLocked] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const supabase = createClientComponentClient();

  // Allowed categories
  const allowedCategories = [
    "Technology",
    "Sports",
    "Politics",
    "Health",
    "Entertainment",
    "Science",
    "Business",
    "Travel",
    "Lifestyle",
    "Education",
  ];

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;

        setUser(user);

        if (user) {
          const { data, error } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          if (error) {
            if (error.code === "PGRST116") {
              // Profile doesn't exist, create a new one
              const { data: newProfile, error: createError } = await supabase
                .from("user_profiles")
                .insert([
                  {
                    id: user.id,
                    display_name: user.user_metadata.full_name || "New User",
                    bio: "",
                    followers: 0,
                    website: "",
                    created_at: new Date().toISOString(),
                  },
                ])
                .select()
                .single();
              if (createError) throw createError;
              setProfile(newProfile);
            } else {
              throw error;
            }
          } else {
            setProfile(data);
          }
        }
      } catch (error) {
        console.error("Error fetching/creating profile:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndProfile();
  }, [supabase]);

  const handleCategoryAdd = () => {
    const normalizedCategory = category.trim().toLowerCase();
    const isValidCategory = allowedCategories.some(
      (cat) => cat.toLowerCase() === normalizedCategory
    );

    if (isValidCategory) {
      setIsCategoryLocked(true);
      alert("Category added successfully!");
    } else {
      alert("Invalid category. Please choose from the allowed categories.");
      setCategory("");
    }
  };

  const handleCategoryRemove = () => {
    setCategory("");
    setIsCategoryLocked(false);
  };

  const validateLink = async () => {
    setImagePreview("");
    try {
      const response = await fetch(`/api/link?url=${encodeURIComponent(link)}`);
      const data = await response.json();

      if (response.ok) {
        setTitle(data.title || "");
        setImageUrl(data.imageUrl || "");
        setDomain(data.websiteName || "");
        setReadTime(data.readingTime?.toString() || "");
        setImagePreview(data.imageUrl || "");
      } else {
        alert("Failed to validate the link.");
      }
    } catch (error) {
      alert("An error occurred while validating the link.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !imageUrl || !domain || !category) {
      alert("Please ensure all required fields are filled.");
      return;
    }

    try {
      const { data, error } = await supabase.from("posts").insert([
        {
          title,
          image_url: imageUrl,
          link,
          domain,
          read_time: readTime,
          category,
          votes: 0,
          comments: 0,
          displayuser: profile?.display_name || "Anonymous",
        },
      ]);

      if (error) throw error;

      alert("Post inserted successfully!");

      // Clear the form
      setTitle("");
      setImageUrl("");
      setLink("");
      setDomain("");
      setReadTime("");
      setCategory("");
      setIsCategoryLocked(false);
      setImagePreview("");
    } catch (error) {
      console.error("Error inserting post:", error.message);
      alert("An error occurred while inserting the post.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Container maxWidth="sm" className={styles.postContainer}>
      <Typography variant="h6" gutterBottom>
        Create New Post
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box mb={2}>
          <TextField
            label="Link"
            variant="standard"
            fullWidth
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onBlur={validateLink}
            required
          />
        </Box>
        <Box mb={2}>
          <TextField
            label="Title"
            variant="standard"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </Box>
        <Box mb={2}>
          <TextField
            label="Domain"
            variant="standard"
            fullWidth
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            required
          />
        </Box>
        <Box mb={2}>
          <TextField
            label="Image URL"
            variant="standard"
            fullWidth
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            required
          />
        </Box>
        <Box mb={2}>
          <TextField
            label="Read Time"
            variant="standard"
            fullWidth
            value={readTime}
            onChange={(e) => setReadTime(e.target.value)}
          />
        </Box>
        <Box mb={2} display="flex" alignItems="center">
          <TextField
            label="Category"
            variant="standard"
            fullWidth
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            helperText="Enter a category (no spaces, only allowed categories)"
            disabled={isCategoryLocked}
          />
          <button
            className={styles.hover3}
            variant="contained"
            color="primary"
            onClick={handleCategoryAdd}
            startIcon={<AddCircleOutlineIcon />}
            sx={{ marginLeft: 2 }}
            disabled={isCategoryLocked}
          >
            Add
          </button>
        </Box>
        {category && (
          <Box mb={2} display="flex" flexWrap="wrap" gap={1}>
            <Chip
              label={category}
              color="secondary"
              variant="standard"
              onDelete={handleCategoryRemove}
              deleteIcon={<ClearIcon />}
            />
          </Box>
        )}
        <button className={styles.hover2} type="submit" fullWidth>
          Submit Post
        </button>
      </form>
    </Container>
  );
};

export default NewPostForm;

"use client";

import React, { useState } from "react";
import { TextField, Button, Typography, Box } from "@mui/material";
import { Google as GoogleIcon } from "@mui/icons-material";
import styles from "./Auth.module.css";
import { supabase } from "../../lib/supabase";

const SignUp = () => {
  const [signUpData, setSignUpData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setSignUpData({ ...signUpData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const { error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
      });
      if (error) throw error;
      // Handle successful sign up (e.g., show confirmation message)
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });
      if (error) throw error;
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Box className={styles.authContainer}>
      <Typography variant="h4" gutterBottom>
        Sign Up
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          name="email"
          label="Email"
          type="email"
          variant="outlined"
          fullWidth
          margin="normal"
          value={signUpData.email}
          onChange={handleChange}
        />
        <TextField
          name="password"
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          value={signUpData.password}
          onChange={handleChange}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          className={styles.submitButton}
        >
          Sign Up
        </Button>
      </form>
      <Button
        variant="outlined"
        startIcon={<GoogleIcon />}
        onClick={handleGoogleSignUp}
        fullWidth
        className={styles.googleButton}
      >
        Sign up with Google
      </Button>
      {error && (
        <Typography color="error" className={styles.errorMessage}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

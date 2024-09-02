import React, { useState } from "react";
import { TextField, Button, Typography, Box } from "@mui/material";
import styles from "./Auth.module.css";
import { supabase } from "../../lib/supabase";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setMessage("Password reset email sent. Check your inbox.");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Box className={styles.authContainer}>
      <Typography variant="h4" gutterBottom>
        Forgot Password
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          name="email"
          label="Email"
          type="email"
          variant="outlined"
          fullWidth
          margin="normal"
          value={email}
          onChange={handleChange}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          className={styles.submitButton}
        >
          Reset Password
        </Button>
      </form>
      {message && (
        <Typography color="primary" className={styles.message}>
          {message}
        </Typography>
      )}
      {error && (
        <Typography color="error" className={styles.errorMessage}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

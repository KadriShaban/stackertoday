"use client";

import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { InputBase } from "@mui/material";
import { motion } from "framer-motion";
import styles from "./Search.module.css"; // Ensure this path is correct

const Search = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleIconClick = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div className={styles.searchContainer}>
      {/* Search Icon Button */}
      <button className={styles.iconButton} onClick={handleIconClick}>
        <FaSearch size="24px" />
      </button>

      {/* Modal Overlay */}
      {isModalOpen && (
        <motion.div
          className={styles.modalOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onClick={handleCloseModal} // Close modal when clicking outside
        >
          {/* Modal Content */}
          <motion.div
            className={styles.modalContent}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.8 }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            {/* Search Input */}
            <InputBase
              placeholder="Search Stacker"
              fullWidth
              value={searchQuery}
              onChange={handleSearchInputChange}
              inputProps={{ style: { fontSize: "2rem", textAlign: "center" } }}
              autoFocus
              className={styles.modalInput}
            />
            {/* Close Button */}
            <button onClick={handleCloseModal} className={styles.closeButton}>
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Search;

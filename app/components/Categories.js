"use client";
import React, { useRef, useEffect } from "react";
import { FaChevronRight } from "react-icons/fa";
import styles from "./categories.module.css";

const Categories = ({ onCategorySelect, selectedCategory }) => {
  const categories = [
    "STAFF PICKS",
    "CULTURE",
    "TECHNOLOGY",
    "BUSINESS",
    "U.S. POLITICS",
    "FINANCE",
    "FOOD & DRINK",
    "SPORTS",
    "ART & ILLUSTRATION",
    "WORLD POLITICS",
    "HEALTH POLITICS",
    "NEWS",
    "ENTERTAINMENT",
    "SCIENCE",
    "TRAVEL   ",
    "        ",
  ];

  const scrollRef = useRef(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    const handleWheelScroll = (event) => {
      event.preventDefault();
      scrollContainer.scrollLeft += event.deltaY;
    };
    if (scrollContainer) {
      scrollContainer.addEventListener("wheel", handleWheelScroll);
    }
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("wheel", handleWheelScroll);
      }
    };
  }, []);

  const handleScrollRight = () => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.scrollLeft += 200;
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.categoriesContainer} ref={scrollRef}>
        {categories.map((category, index) => {
          console.log("Current Category:", category);
          console.log("Selected Category:", selectedCategory);
          return (
            <div
              key={index}
              className={`${styles.categoryLink} ${
                selectedCategory === category ? styles.active : ""
              }`}
              onClick={() => onCategorySelect(category)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onCategorySelect(category)}
            >
              {category}
            </div>
          );
        })}
      </div>
      <div className={styles.fadeOverlay}>
        <div
          className={styles.scrollButton}
          onClick={handleScrollRight}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleScrollRight()}
        >
          <FaChevronRight />
        </div>
      </div>
    </div>
  );
};

export default Categories;

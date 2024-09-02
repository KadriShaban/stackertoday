"use client";

import React, { useEffect, useRef } from "react";
import { FaHome, FaSearch, FaPlusCircle } from "react-icons/fa";
import { IoIosNotifications } from "react-icons/io";
import { HiTrendingUp } from "react-icons/hi";
import styles from "./sidebar.module.css";

const PopupSidebar = ({ onMenuClick }) => {
  const markerRef = useRef(null);
  const listItemsRef = useRef([]);

  useEffect(() => {
    const moveIndicator = (e) => {
      if (markerRef.current) {
        markerRef.current.style.top = `${e.offsetTop}px`;
        markerRef.current.style.height = `${e.offsetHeight}px`;
      }
    };

    const activeClass = function () {
      listItemsRef.current.forEach((item) =>
        item?.classList.remove(styles.active)
      );
      this.classList.add(styles.active);
    };

    listItemsRef.current.forEach((item) => {
      if (item) {
        item.addEventListener("mouseover", activeClass);
        item.addEventListener("mousemove", (e) =>
          moveIndicator(e.currentTarget)
        );
      }
    });

    return () => {
      listItemsRef.current.forEach((item) => {
        if (item) {
          item.removeEventListener("mouseover", activeClass);
          item.removeEventListener("mousemove", (e) =>
            moveIndicator(e.currentTarget)
          );
        }
      });
    };
  }, []);

  return (
    <nav className={styles.sidebar}>
      <img src="" alt="" className={styles.logo} />
      <ul>
        <li
          ref={(el) => (listItemsRef.current[0] = el)}
          className={styles.active}
          onClick={() => onMenuClick("postContainer")} // Show PostContainer
        >
          <a href="#">
            <FaHome />
          </a>
        </li>
        <li
          ref={(el) => (listItemsRef.current[1] = el)}
          onClick={() => onMenuClick("notification")} // Show Notification component
        >
          <a href="#">
            <IoIosNotifications />
          </a>
        </li>
        <li
          ref={(el) => (listItemsRef.current[2] = el)}
          onClick={() => onMenuClick("search")}
        >
          <a href="#">
            <FaSearch />
          </a>
        </li>
        <li
          ref={(el) => (listItemsRef.current[3] = el)}
          onClick={() => onMenuClick("trending")}
        >
          <a href="#">
            <HiTrendingUp />
          </a>
        </li>
        <li
          ref={(el) => (listItemsRef.current[4] = el)}
          onClick={() => onMenuClick("newPostForm")} // Show NewPostForm
        >
          <a href="#">
            <FaPlusCircle />
          </a>
        </li>
        <div id={styles.marker} ref={markerRef}></div>
      </ul>
    </nav>
  );
};

export default PopupSidebar;

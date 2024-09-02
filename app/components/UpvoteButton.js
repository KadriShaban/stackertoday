import { useState } from "react";
import { ChevronUp } from "lucide-react";
import styles from "./UpvoteButton.module.css";

export default function UpvoteButton() {
  const [upvoted, setUpvoted] = useState(false);

  const handleUpvote = () => {
    setUpvoted((prev) => !prev);
  };

  return (
    <button
      className={`${styles.button} ${upvoted ? styles.active : ""}`}
      onClick={handleUpvote}
    >
      <span className={styles.bg}></span>
      <span className={styles.symbol}>
        <ChevronUp className={upvoted ? styles.upvoted : ""} size={24} />
      </span>
    </button>
  );
}

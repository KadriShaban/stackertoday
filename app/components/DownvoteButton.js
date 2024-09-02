import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import styles from "./DownvoteButton.module.css";

export default function DownvoteButton() {
  const [Downvoted, setDownvoted] = useState(false);

  const handleDownvote = () => {
    setDownvoted((prev) => !prev);
  };

  return (
    <button
      className={`${styles.button} ${Downvoted ? styles.active : ""}`}
      onClick={handleDownvote}
    >
      <span className={styles.bg}></span>
      <span className={styles.symbol}>
        <ChevronDown className={Downvoted ? styles.upvoted : ""} size={24} />
      </span>
    </button>
  );
}

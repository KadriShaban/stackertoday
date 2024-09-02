// components/ReplyHandler.js

import { TextField, Button } from "@mui/material";

const ReplyHandler = ({
  commentId,
  handleReplySubmit,
  handleReplyChange,
  replyContent,
}) => {
  return (
    <div style={{ marginTop: "0.5rem" }}>
      <TextField
        label="Reply"
        variant="outlined"
        size="small"
        fullWidth
        value={replyContent[commentId] || ""}
        onChange={(e) => handleReplyChange(commentId, e.target.value)}
        style={{ marginBottom: "0.5rem" }}
      />
      <Button
        variant="contained"
        color="primary"
        size="small"
        onClick={() => handleReplySubmit(commentId)}
      >
        Submit Reply
      </Button>
    </div>
  );
};

export default ReplyHandler;

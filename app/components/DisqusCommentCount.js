// components/DisqusCommentCount.js
"use client";

import { CommentCount } from "disqus-react";

const DisqusCommentCount = ({ post }) => {
  const disqusShortname = "your-disqus-shortname"; // Replace with your Disqus shortname
  const disqusConfig = {
    url: `http://localhost:3000/posts/${post.slug}`, // Replace with your post's URL
    identifier: post.id.toString(), // Use post ID as unique identifier
    title: post.title, // Use post title for thread title
  };

  return (
    <CommentCount shortname={disqusShortname} config={disqusConfig}>
      {/* Placeholder Text */}
      Comments
    </CommentCount>
  );
};

export default DisqusCommentCount;

// components/DisqusComments.js
"use client";

import { DiscussionEmbed } from "disqus-react";

const DisqusComments = ({ post }) => {
  const disqusShortname = "stackertoday"; // Replace with your Disqus shortname
  const disqusConfig = {
    url: `http://localhost:3000/posts/${post.slug}`, // Replace with your post's URL
    identifier: post.id.toString(), // Use post ID as unique identifier
    title: post.title, // Use post title for thread title
    language: "en", // Optional: specify language
  };

  return <DiscussionEmbed shortname={disqusShortname} config={disqusConfig} />;
};

export default DisqusComments;

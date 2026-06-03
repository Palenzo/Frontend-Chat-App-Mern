import React from "react";
import { Helmet } from "react-helmet-async";

const Title = ({
  title = "ChatKroo",
  description = "ChatKroo — real-time chat with calling and an AI assistant.",
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
    </Helmet>
  );
};

export default Title;

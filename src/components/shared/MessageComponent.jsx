import { Box, Typography } from "@mui/material";
import React, { memo } from "react";
import { messageSent, messageSentLight, messageReceived, messageReceivedBorder, textSecondary } from "../../constants/color";
import moment from "moment";
import { fileFormat } from "../../lib/features";
import RenderAttachment from "./RenderAttachment";
import { motion } from "framer-motion";

const MessageComponent = ({ message, user }) => {
  const { sender, content, attachments = [], createdAt } = message;

  const sameSender = sender?._id === user?._id;

  const timeAgo = moment(createdAt).fromNow();

  return (
    <motion.div
      initial={{ opacity: 0, x: sameSender ? "100%" : "-100%" }}
      whileInView={{ opacity: 1, x: 0 }}
      style={{
        alignSelf: sameSender ? "flex-end" : "flex-start",
        maxWidth: "75%",
        width: "fit-content",
      }}
    >
      <Box
        sx={{
          backgroundColor: sameSender ? messageSent : messageReceived,
          color: sameSender ? "white" : "black",
          borderRadius: sameSender ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          padding: "10px 14px",
          wordWrap: "break-word",
          overflowWrap: "break-word",
          wordBreak: "break-word",
          maxWidth: "100%",
          border: sameSender ? "none" : `1px solid ${messageReceivedBorder}`,
          boxShadow: sameSender 
            ? "0 2px 8px rgba(102, 126, 234, 0.25)" 
            : "0 1px 3px rgba(0, 0, 0, 0.08)",
        }}
      >
        {!sameSender && (
          <Typography 
            color={messageSent} 
            fontWeight="600" 
            variant="caption"
            sx={{ mb: 0.5, display: "block" }}
          >
            {sender.name}
          </Typography>
        )}

        {content && (
          <Typography 
            sx={{ 
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
              overflowWrap: "break-word",
              maxWidth: "100%",
            }}
          >
            {content}
          </Typography>
        )}

        {attachments.length > 0 &&
          attachments.map((attachment, index) => {
            const url = attachment.url;
            const file = fileFormat(url);

            return (
              <Box 
                key={index}
                sx={{
                  mt: content ? 1 : 0,
                  maxWidth: "100%",
                  overflow: "hidden",
                }}
              >
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  style={{
                    color: sameSender ? "white" : messageSent,
                    textDecoration: "underline",
                    wordBreak: "break-all",
                  }}
                >
                  {RenderAttachment(file, url)}
                </a>
              </Box>
            );
          })}

        <Typography 
          variant="caption" 
          sx={{ 
            color: sameSender ? "rgba(255,255,255,0.8)" : textSecondary,
            display: "block",
            mt: 0.5,
            fontSize: "0.7rem",
          }}
        >
          {timeAgo}
        </Typography>
      </Box>
    </motion.div>
  );
};

export default memo(MessageComponent);


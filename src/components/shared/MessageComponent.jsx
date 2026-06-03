import { Avatar, Box, Typography, useTheme } from "@mui/material";
import React, { memo } from "react";
import moment from "moment";
import { fileFormat } from "../../lib/features";
import RenderAttachment from "./RenderAttachment";
import { motion } from "framer-motion";
import { bubble, radii, easing } from "../../theme/tokens";

const MessageComponent = ({
  message,
  user,
  firstInGroup = true,
  lastInGroup = true,
  isGroupChat = false,
}) => {
  const { sender, content, attachments = [], createdAt } = message;
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";
  const mine = sender?._id === user?._id;

  const time = moment(createdAt).format("h:mm A");
  const sentBg = dark ? bubble.sent.dark : bubble.sent.light;
  const recvBg = dark ? bubble.received.dark : bubble.received.light;

  // No tails: full radius, with the anchored side tightened between grouped bubbles.
  const r = radii.bubble;
  const tight = 7;
  const tl = mine ? r : firstInGroup ? r : tight;
  const tr = mine ? (firstInGroup ? r : tight) : r;
  const br = mine ? (lastInGroup ? r : tight) : r;
  const bl = mine ? r : lastInGroup ? r : tight;
  const radius = `${tl}px ${tr}px ${br}px ${bl}px`;

  const showAvatar = !mine && isGroupChat;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: "flex",
        justifyContent: mine ? "flex-end" : "flex-start",
        marginBottom: lastInGroup ? 14 : 3,
        transitionTimingFunction: easing,
      }}
    >
      {showAvatar && (
        <Box sx={{ width: 28, mr: 1, alignSelf: "flex-end", flexShrink: 0 }}>
          {lastInGroup && (
            <Avatar sx={{ width: 28, height: 28, fontSize: 13, bgcolor: "primary.dark" }}>
              {sender?.name?.[0]?.toUpperCase()}
            </Avatar>
          )}
        </Box>
      )}

      <Box sx={{ maxWidth: "72%", minWidth: 0, display: "flex", flexDirection: "column" }}>
        {showAvatar && firstInGroup && (
          <Typography
            variant="caption"
            sx={{ color: "primary.main", fontWeight: 600, ml: 1.5, mb: 0.25 }}
          >
            {sender?.name}
          </Typography>
        )}

        <Box
          sx={{
            bgcolor: mine ? sentBg : recvBg,
            color: mine ? "#fff" : "text.primary",
            borderRadius: radius,
            px: 1.6,
            py: 1,
            width: "fit-content",
            maxWidth: "100%",
            alignSelf: mine ? "flex-end" : "flex-start",
            wordBreak: "break-word",
          }}
        >
          {content && (
            <Typography sx={{ fontSize: 15, lineHeight: 1.42, whiteSpace: "pre-wrap" }}>
              {content}
            </Typography>
          )}

          {attachments.length > 0 &&
            attachments.map((attachment, index) => {
              const url = attachment.url;
              const file = fileFormat(url);
              return (
                <Box key={index} sx={{ mt: content ? 1 : 0, maxWidth: "100%", overflow: "hidden" }}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    download
                    style={{
                      color: mine ? "#fff" : theme.palette.primary.main,
                      textDecoration: "underline",
                      wordBreak: "break-all",
                    }}
                  >
                    {RenderAttachment(file, url)}
                  </a>
                </Box>
              );
            })}
        </Box>

        {lastInGroup && (
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontSize: "0.68rem",
              mt: 0.4,
              px: 0.6,
              alignSelf: mine ? "flex-end" : "flex-start",
            }}
          >
            {time}
          </Typography>
        )}
      </Box>
    </motion.div>
  );
};

export default memo(MessageComponent);

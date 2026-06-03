import React, { memo } from "react";
import { Link } from "../styles/StyledComponents";
import { Box, Stack, Typography, useTheme } from "@mui/material";
import AvatarCard from "./AvatarCard";
import { motion } from "framer-motion";

const ChatItem = ({
  avatar = [],
  name,
  _id,
  groupChat = false,
  sameSender,
  isOnline,
  newMessageAlert,
  index = 0,
  handleDeleteChat,
}) => {
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";
  const unread = newMessageAlert?.count || 0;

  const activeBg = dark ? "rgba(124,131,255,0.14)" : "rgba(102,126,234,0.10)";
  const hoverBg = dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";

  return (
    <Link sx={{ padding: 0 }} to={`/chat/${_id}`} onContextMenu={(e) => handleDeleteChat(e, _id, groupChat)}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.03, 0.3) }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            alignItems: "center",
            m: "2px 8px",
            p: "10px 12px",
            borderRadius: 3,
            cursor: "pointer",
            bgcolor: sameSender ? activeBg : "transparent",
            transition: "background-color 0.15s",
            "&:hover": { bgcolor: sameSender ? activeBg : hoverBg },
          }}
        >
          <Box sx={{ position: "relative", flexShrink: 0 }}>
            <AvatarCard avatar={avatar} />
            {isOnline && (
              <Box
                sx={{
                  position: "absolute",
                  right: -1,
                  bottom: -1,
                  width: 13,
                  height: 13,
                  borderRadius: "50%",
                  bgcolor: "success.main",
                  border: `2.5px solid ${theme.palette.background.paper}`,
                }}
              />
            )}
          </Box>

          <Stack sx={{ minWidth: 0, flex: 1 }} spacing={0.2}>
            <Typography
              noWrap
              fontWeight={650}
              fontSize={15}
              color={sameSender ? "primary.main" : "text.primary"}
            >
              {name}
            </Typography>
            <Typography noWrap variant="body2" color="text.secondary" fontSize={13}>
              {unread
                ? `${unread} new message${unread > 1 ? "s" : ""}`
                : groupChat
                ? "Group chat"
                : "Tap to open"}
            </Typography>
          </Stack>

          {unread > 0 && (
            <Box
              sx={{
                minWidth: 20,
                height: 20,
                px: 0.75,
                borderRadius: 99,
                bgcolor: "primary.main",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                display: "grid",
                placeItems: "center",
              }}
            >
              {unread}
            </Box>
          )}
        </Box>
      </motion.div>
    </Link>
  );
};

export default memo(ChatItem);

import React from "react";
import AppLayout from "../components/layout/AppLayout";
import { Box, Typography, Stack } from "@mui/material";
import {
  SmartToy as AIIcon,
  ChatBubbleOutline as ChatIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { brand, brandGradient } from "../theme/tokens";

const MotionStack = motion(Stack);

const Home = () => {
  return (
    <Box
      height="100%"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
        bgcolor: "background.default",
      }}
    >
      <MotionStack
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        spacing={3}
        alignItems="center"
        sx={{ maxWidth: 420, textAlign: "center" }}
      >
        <Box
          aria-hidden
          sx={{
            width: 96,
            height: 96,
            borderRadius: "28px",
            display: "grid",
            placeItems: "center",
            backgroundImage: brandGradient,
            boxShadow: "0 12px 32px rgba(102, 126, 234, 0.35)",
          }}
        >
          <ChatIcon sx={{ fontSize: 48, color: "#fff" }} />
        </Box>

        <Stack spacing={1} alignItems="center">
          <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em">
            Welcome to ChatKroo
          </Typography>
          <Typography variant="body1" color="text.secondary" maxWidth="32ch">
            Pick a conversation on the left to start chatting, calling, and
            sharing.
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={1.25}
          alignItems="center"
          sx={{
            px: 2,
            py: 1.25,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <AIIcon sx={{ color: brand[500] }} />
          <Typography variant="body2" fontWeight={600}>
            New here? Say hi to Binod, your AI assistant.
          </Typography>
        </Stack>
      </MotionStack>
    </Box>
  );
};

export default AppLayout()(Home);

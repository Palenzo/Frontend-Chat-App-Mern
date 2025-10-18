import React from "react";
import AppLayout from "../components/layout/AppLayout";
import { Box, Typography, Stack, Paper } from "@mui/material";
import { SmartToy as AIIcon, Chat as ChatIcon } from "@mui/icons-material";
import { motion } from "framer-motion";

const Home = () => {
  return (
    <Box 
      height={"100%"} 
      sx={{ 
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          elevation={10}
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 4,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            maxWidth: 500,
          }}
        >
          <Stack spacing={3} alignItems="center">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <ChatIcon sx={{ fontSize: 80, color: "#667eea" }} />
            </motion.div>

            <Typography 
              variant="h4" 
              fontWeight="bold"
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Welcome to ChatKroo! 💬
            </Typography>

            <Typography variant="body1" color="text.secondary">
              Select a friend from the left to start chatting
            </Typography>

            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 2,
                background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                border: "1px solid rgba(102, 126, 234, 0.3)",
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                <AIIcon sx={{ color: "#667eea" }} />
                <Typography variant="body2" fontWeight="600" color="#667eea">
                  Try chatting with Binod, our AI assistant! 🤖
                </Typography>
              </Stack>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
              Made with ❤️ by ChatKroo Team
            </Typography>
          </Stack>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default AppLayout()(Home);

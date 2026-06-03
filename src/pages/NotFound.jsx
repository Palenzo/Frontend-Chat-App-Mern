import React from "react";
import { SentimentDissatisfied as SadIcon } from "@mui/icons-material";
import { Box, Button, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";

const NotFound = () => (
  <Box
    sx={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      bgcolor: "background.default",
      p: 3,
    }}
  >
    <Stack alignItems="center" spacing={2} textAlign="center">
      <SadIcon sx={{ fontSize: 72, color: "text.secondary" }} />
      <Typography
        variant="h2"
        fontWeight={800}
        sx={{ color: "primary.main", letterSpacing: "-0.03em" }}
      >
        404
      </Typography>
      <Typography variant="h6" fontWeight={700}>
        Page not found
      </Typography>
      <Typography variant="body2" color="text.secondary" maxWidth="34ch">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </Typography>
      <Button component={Link} to="/" variant="contained" sx={{ mt: 1 }}>
        Back to ChatKroo
      </Button>
    </Stack>
  </Box>
);

export default NotFound;

import { Dialog, DialogContent, Stack, Avatar, Typography, IconButton, Box } from "@mui/material";
import { Call as CallIcon, CallEnd as CallEndIcon, Videocam as VideocamIcon } from "@mui/icons-material";
import { useWebRTC } from "../../context/WebRTCContext";
import { motion } from "framer-motion";

const IncomingCallDialog = () => {
  const { incomingCall, acceptCall, rejectCall } = useWebRTC();
  if (!incomingCall) return null;
  const { caller, callType } = incomingCall;
  const isVideoCall = callType === "video";

  return (
    <Dialog open={Boolean(incomingCall)} PaperProps={{ sx: { borderRadius: 3, backgroundColor: "background.paper", minWidth: 400 } }}>
      <DialogContent>
        <Stack alignItems="center" spacing={3} py={2}>
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
            <Avatar src={caller?.avatar?.url} alt={caller?.name} sx={{ width: 120, height: 120, border: "4px solid", borderColor: "primary.main" }} />
          </motion.div>
          <Stack alignItems="center" spacing={1}>
            <Typography variant="h5" fontWeight={600}>{caller?.name}</Typography>
            <Typography variant="body1" color="text.secondary">Incoming {isVideoCall ? "Video" : "Audio"} Call</Typography>
          </Stack>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 60, height: 60, borderRadius: "50%", backgroundColor: "primary.light", color: "primary.main" }}>
            {isVideoCall ? <VideocamIcon sx={{ fontSize: 32 }} /> : <CallIcon sx={{ fontSize: 32 }} />}
          </Box>
          <Stack direction="row" spacing={4} mt={2}>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <IconButton onClick={rejectCall} sx={{ backgroundColor: "#f44336", color: "white", width: 70, height: 70, "&:hover": { backgroundColor: "#d32f2f" } }}>
                <CallEndIcon sx={{ fontSize: 32 }} />
              </IconButton>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} animate={{ y: [0, -5, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
              <IconButton onClick={acceptCall} sx={{ backgroundColor: "#4caf50", color: "white", width: 70, height: 70, "&:hover": { backgroundColor: "#388e3c" } }}>
                {isVideoCall ? <VideocamIcon sx={{ fontSize: 32 }} /> : <CallIcon sx={{ fontSize: 32 }} />}
              </IconButton>
            </motion.div>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default IncomingCallDialog;

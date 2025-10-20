import { IconButton, Tooltip } from "@mui/material";
import { Call as CallIcon, Videocam as VideocamIcon } from "@mui/icons-material";
import { useWebRTC } from "../../context/WebRTCContext";
import { motion } from "framer-motion";

const CallButtons = ({ members, user }) => {
  const { initiateCall, isCallActive } = useWebRTC();
  const otherUser = members?.find((member) => member._id !== user._id);
  if (!otherUser) return null;

  const handleAudioCall = () => {
    if (isCallActive) return;
    initiateCall(otherUser._id, otherUser, "audio");
  };

  const handleVideoCall = () => {
    if (isCallActive) return;
    initiateCall(otherUser._id, otherUser, "video");
  };

  return (
    <>
      <Tooltip title="Voice Call">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <IconButton onClick={handleAudioCall} disabled={isCallActive} sx={{ color: "primary.main", "&:hover": { bgcolor: "primary.light" } }}>
            <CallIcon />
          </IconButton>
        </motion.div>
      </Tooltip>
      <Tooltip title="Video Call">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <IconButton onClick={handleVideoCall} disabled={isCallActive} sx={{ color: "primary.main", "&:hover": { bgcolor: "primary.light" } }}>
            <VideocamIcon />
          </IconButton>
        </motion.div>
      </Tooltip>
    </>
  );
};

export default CallButtons;

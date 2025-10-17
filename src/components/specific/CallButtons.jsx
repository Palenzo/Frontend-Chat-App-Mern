import React, { useState } from 'react';
import {
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Badge,
} from '@mui/material';
import {
  Call as CallIcon,
  Videocam as VideocamIcon,
  History as HistoryIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useCall } from '../../context/CallContext';
import CallHistoryDialog from '../dialogs/CallHistoryDialog';
import { motion } from 'framer-motion';

const CallButtons = ({ chatId, members, user }) => {
  const { initiateCall } = useCall();
  const [anchorEl, setAnchorEl] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  // Get the other user in the chat
  const getOtherUser = () => {
    return members?.find((member) => member._id !== user._id);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleVoiceCall = () => {
    const otherUser = getOtherUser();
    if (otherUser) {
      initiateCall(chatId, otherUser._id, 'audio', otherUser.name);
    }
    handleMenuClose();
  };

  const handleVideoCall = () => {
    const otherUser = getOtherUser();
    if (otherUser) {
      initiateCall(chatId, otherUser._id, 'video', otherUser.name);
    }
    handleMenuClose();
  };

  const handleShowHistory = () => {
    setShowHistory(true);
    handleMenuClose();
  };

  // Don't show call buttons for group chats (for now)
  if (!members || members.length !== 2) {
    return null;
  }

  return (
    <>
      {/* Quick Action Buttons */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Tooltip title="Voice Call">
          <IconButton
            onClick={handleVoiceCall}
            sx={{
              color: '#10b981',
              '&:hover': {
                bgcolor: 'rgba(16, 185, 129, 0.1)',
              },
            }}
          >
            <CallIcon />
          </IconButton>
        </Tooltip>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Tooltip title="Video Call">
          <IconButton
            onClick={handleVideoCall}
            sx={{
              color: '#3b82f6',
              '&:hover': {
                bgcolor: 'rgba(59, 130, 246, 0.1)',
              },
            }}
          >
            <VideocamIcon />
          </IconButton>
        </Tooltip>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Tooltip title="More options">
          <IconButton onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
        </Tooltip>
      </motion.div>

      {/* Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 200,
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          },
        }}
      >
        <MenuItem onClick={handleVoiceCall}>
          <ListItemIcon>
            <CallIcon sx={{ color: '#10b981' }} />
          </ListItemIcon>
          <ListItemText primary="Voice Call" />
        </MenuItem>

        <MenuItem onClick={handleVideoCall}>
          <ListItemIcon>
            <VideocamIcon sx={{ color: '#3b82f6' }} />
          </ListItemIcon>
          <ListItemText primary="Video Call" />
        </MenuItem>

        <MenuItem onClick={handleShowHistory}>
          <ListItemIcon>
            <HistoryIcon sx={{ color: '#f59e0b' }} />
          </ListItemIcon>
          <ListItemText primary="Call History" />
        </MenuItem>
      </Menu>

      {/* Call History Dialog */}
      <CallHistoryDialog
        open={showHistory}
        onClose={() => setShowHistory(false)}
        chatId={chatId}
        user={user}
      />
    </>
  );
};

export default CallButtons;

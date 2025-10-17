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
import toast from 'react-hot-toast';

const CallButtons = ({ chatId, members, user }) => {
  const { initiateCall, activeCall } = useCall();
  const [anchorEl, setAnchorEl] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isInitiating, setIsInitiating] = useState(false);

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

  const handleVoiceCall = async () => {
    console.log('=== VOICE CALL DEBUG ===');
    console.log('chatId:', chatId);
    console.log('members array:', members);
    console.log('user:', user);
    
    const otherUser = getOtherUser();
    console.log('otherUser found:', otherUser);
    
    // Validation
    if (!chatId) {
      console.error('ChatId is missing');
      toast.error('Unable to initiate call: Chat ID missing');
      return;
    }
    
    if (!otherUser || !otherUser._id) {
      console.error('Receiver not found - otherUser:', otherUser);
      toast.error('Unable to initiate call: Receiver not found');
      return;
    }

    if (activeCall) {
      toast.error('You already have an active call');
      return;
    }
    
    try {
      setIsInitiating(true);
      toast.loading('Starting voice call...', { id: 'voice-call' });
      
      console.log('Initiating voice call:', {
        chatId,
        receiverId: otherUser._id,
        callType: 'audio',
        receiverName: otherUser.name
      });
      
      await initiateCall(chatId, otherUser._id, 'audio', otherUser.name);
      toast.success(`Calling ${otherUser.name}...`, { id: 'voice-call' });
      handleMenuClose();
    } catch (error) {
      console.error('Voice call error:', error);
      toast.error('Failed to start call', { id: 'voice-call' });
    } finally {
      setIsInitiating(false);
    }
  };

  const handleVideoCall = async () => {
    console.log('=== VIDEO CALL DEBUG ===');
    console.log('chatId:', chatId);
    console.log('members array:', members);
    console.log('user:', user);
    
    const otherUser = getOtherUser();
    console.log('otherUser found:', otherUser);
    
    // Validation
    if (!chatId) {
      console.error('ChatId is missing');
      toast.error('Unable to initiate call: Chat ID missing');
      return;
    }
    
    if (!otherUser || !otherUser._id) {
      console.error('Receiver not found - otherUser:', otherUser);
      toast.error('Unable to initiate call: Receiver not found');
      return;
    }

    if (activeCall) {
      toast.error('You already have an active call');
      return;
    }
    
    try {
      setIsInitiating(true);
      toast.loading('Starting video call...', { id: 'video-call' });
      
      console.log('Initiating video call:', {
        chatId,
        receiverId: otherUser._id,
        callType: 'video',
        receiverName: otherUser.name
      });
      
      await initiateCall(chatId, otherUser._id, 'video', otherUser.name);
      toast.success(`Video calling ${otherUser.name}...`, { id: 'video-call' });
      handleMenuClose();
    } catch (error) {
      console.error('Video call error:', error);
      toast.error('Failed to start video call', { id: 'video-call' });
    } finally {
      setIsInitiating(false);
    }
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
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
      >
        <Tooltip title="Voice Call" arrow>
          <IconButton
            onClick={handleVoiceCall}
            disabled={isInitiating || activeCall}
            sx={{
              color: '#10b981',
              bgcolor: 'rgba(16, 185, 129, 0.1)',
              border: '2px solid rgba(16, 185, 129, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: 'rgba(16, 185, 129, 0.2)',
                borderColor: '#10b981',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              },
              '&:disabled': {
                opacity: 0.5,
                cursor: 'not-allowed',
              },
            }}
          >
            <CallIcon fontSize="medium" />
          </IconButton>
        </Tooltip>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
      >
        <Tooltip title="Video Call" arrow>
          <IconButton
            onClick={handleVideoCall}
            disabled={isInitiating || activeCall}
            sx={{
              color: '#3b82f6',
              bgcolor: 'rgba(59, 130, 246, 0.1)',
              border: '2px solid rgba(59, 130, 246, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: 'rgba(59, 130, 246, 0.2)',
                borderColor: '#3b82f6',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              },
              '&:disabled': {
                opacity: 0.5,
                cursor: 'not-allowed',
              },
            }}
          >
            <VideocamIcon fontSize="medium" />
          </IconButton>
        </Tooltip>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
      >
        <Tooltip title="More options" arrow>
          <IconButton 
            onClick={handleMenuOpen}
            sx={{
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'rotate(90deg)',
              },
            }}
          >
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
          sx={{
            borderRadius: 2,
            minWidth: 220,
            boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
            border: '1px solid rgba(0,0,0,0.05)',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem 
          onClick={handleVoiceCall}
          disabled={isInitiating || activeCall}
          sx={{
            py: 1.5,
            '&:hover': {
              bgcolor: 'rgba(16, 185, 129, 0.08)',
            },
          }}
        >
          <ListItemIcon>
            <CallIcon sx={{ color: '#10b981', fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText 
            primary="Voice Call" 
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </MenuItem>

        <MenuItem 
          onClick={handleVideoCall}
          disabled={isInitiating || activeCall}
          sx={{
            py: 1.5,
            '&:hover': {
              bgcolor: 'rgba(59, 130, 246, 0.08)',
            },
          }}
        >
          <ListItemIcon>
            <VideocamIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText 
            primary="Video Call" 
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </MenuItem>

        <MenuItem 
          onClick={handleShowHistory}
          sx={{
            py: 1.5,
            '&:hover': {
              bgcolor: 'rgba(245, 158, 11, 0.08)',
            },
          }}
        >
          <ListItemIcon>
            <HistoryIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText 
            primary="Call History" 
            primaryTypographyProps={{ fontWeight: 500 }}
          />
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

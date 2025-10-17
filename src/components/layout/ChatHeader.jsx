import React from 'react';
import { Stack, Avatar, Typography, IconButton, Box, Chip } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import CallButtons from '../specific/CallButtons';
import { motion } from 'framer-motion';

const ChatHeader = ({ chat, members, user, onlineUsers = [] }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  // Get other user in one-to-one chat
  const otherUser = chat?.groupChat
    ? null
    : members?.find((member) => member._id !== user._id);

  // Check if user is online
  const isOnline = otherUser && onlineUsers.includes(otherUser._id);

  const displayName = chat?.groupChat ? chat.name : otherUser?.name || 'Chat';
  const displayAvatar = chat?.groupChat
    ? null
    : otherUser?.avatar?.url;

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{
          py: 1.5,
          px: 2,
        }}
      >
        {/* Back Button (Mobile) */}
        <IconButton
          onClick={handleBack}
          sx={{
            display: { xs: 'block', sm: 'none' },
          }}
        >
          <ArrowBackIcon />
        </IconButton>

        {/* Avatar and Name */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{ flex: 1, cursor: 'pointer' }}
        >
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={displayAvatar}
              sx={{
                width: 45,
                height: 45,
                border: chat?.groupChat ? '2px solid #667eea' : isOnline ? '3px solid #10b981' : 'none',
                boxShadow: chat?.groupChat || isOnline ? '0 0 10px rgba(102, 126, 234, 0.3)' : 'none',
              }}
            >
              {displayName?.[0]?.toUpperCase()}
            </Avatar>
            
            {/* Online indicator */}
            {!chat?.groupChat && isOnline && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  position: 'absolute',
                  bottom: 2,
                  right: 2,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  border: '2px solid white',
                }}
              />
            )}
          </Box>

          <Box>
            <Typography variant="h6" fontWeight="bold">
              {displayName}
            </Typography>
            
            {chat?.groupChat ? (
              <Typography variant="caption" color="text.secondary">
                {members?.length} members
              </Typography>
            ) : (
              <Typography
                variant="caption"
                sx={{
                  color: isOnline ? '#10b981' : 'text.secondary',
                  fontWeight: isOnline ? 'bold' : 'normal',
                }}
              >
                {isOnline ? 'Online' : 'Offline'}
              </Typography>
            )}
          </Box>
        </Stack>

        {/* Call Buttons */}
        {!chat?.groupChat && members && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <CallButtons chatId={chat?._id} members={members} user={user} />
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default ChatHeader;

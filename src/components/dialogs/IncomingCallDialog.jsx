import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Avatar,
  Stack,
  Slide,
} from '@mui/material';
import {
  Call as CallIcon,
  CallEnd as CallEndIcon,
  Videocam as VideocamIcon,
} from '@mui/icons-material';
import { useCall } from '../../context/CallContext';
import { motion } from 'framer-motion';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const IncomingCallDialog = () => {
  const { isIncomingCall, currentCall, acceptCall, rejectCall, callType } = useCall();

  if (!isIncomingCall || !currentCall) return null;

  const caller = currentCall.call?.caller || currentCall.caller;

  return (
    <Dialog
      open={isIncomingCall}
      TransitionComponent={Transition}
      keepMounted
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          minWidth: { xs: '90%', sm: 400 },
          overflow: 'visible',
        },
      }}
    >
      <DialogContent
        sx={{
          textAlign: 'center',
          color: 'white',
          py: 4,
        }}
      >
        {/* Animated rings around avatar */}
        <Box
          sx={{
            position: 'relative',
            display: 'inline-block',
            mb: 3,
          }}
        >
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 120,
                height: 120,
                borderRadius: '50%',
                border: '2px solid rgba(255, 255, 255, 0.5)',
              }}
              animate={{
                scale: [1, 1.5, 1.5],
                opacity: [0.5, 0, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.4,
              }}
            />
          ))}
          
          <Avatar
            src={caller.avatar?.url}
            sx={{
              width: 100,
              height: 100,
              border: '4px solid white',
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
            }}
          >
            {caller.name?.[0]?.toUpperCase()}
          </Avatar>
        </Box>

        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {caller.name || 'Unknown'}
        </Typography>

        <Typography variant="body1" sx={{ opacity: 0.9, mb: 1 }}>
          {callType === 'video' ? 'Incoming Video Call' : 'Incoming Voice Call'}
        </Typography>

        <motion.div
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
        >
          {callType === 'video' ? (
            <VideocamIcon sx={{ fontSize: 40, my: 2 }} />
          ) : (
            <CallIcon sx={{ fontSize: 40, my: 2 }} />
          )}
        </motion.div>

        <Stack
          direction="row"
          spacing={4}
          justifyContent="center"
          sx={{ mt: 4 }}
        >
          {/* Reject Button */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconButton
              onClick={rejectCall}
              sx={{
                width: 70,
                height: 70,
                bgcolor: '#ef4444',
                color: 'white',
                '&:hover': {
                  bgcolor: '#dc2626',
                  transform: 'rotate(135deg)',
                  transition: 'all 0.3s',
                },
              }}
            >
              <CallEndIcon sx={{ fontSize: 32 }} />
            </IconButton>
          </motion.div>

          {/* Accept Button */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconButton
              onClick={acceptCall}
              sx={{
                width: 70,
                height: 70,
                bgcolor: '#10b981',
                color: 'white',
                '&:hover': {
                  bgcolor: '#059669',
                  transform: 'scale(1.1)',
                  transition: 'all 0.3s',
                },
              }}
            >
              <CallIcon sx={{ fontSize: 32 }} />
            </IconButton>
          </motion.div>
        </Stack>

        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 3,
            opacity: 0.8,
          }}
        >
          {callType === 'video'
            ? 'Camera and microphone will be accessed'
            : 'Microphone will be accessed'}
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default IncomingCallDialog;

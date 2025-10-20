import React, { useEffect, useRef } from 'react';
import {
  Dialog,
  Box,
  IconButton,
  Typography,
  Avatar,
  Stack,
  Paper,
  Zoom,
} from '@mui/material';
import {
  CallEnd as CallEndIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  Fullscreen as FullscreenIcon,
} from '@mui/icons-material';
import { useCall } from '../../context/CallContext';
import { motion, AnimatePresence } from 'framer-motion';

const ActiveCallDialog = () => {
  const {
    isCallActive,
    currentCall,
    callType,
    isCallConnected,
    isAudioMuted,
    isVideoOff,
    callDuration,
    otherUser,
    localVideoRef,
    remoteVideoRef,
    endCall,
    toggleAudio,
    toggleVideo,
    formatDuration,
  } = useCall();

  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [showControls, setShowControls] = React.useState(true);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // Auto-hide controls after inactivity
  useEffect(() => {
    if (!isCallActive) return;

    const handleMouseMove = () => {
      setShowControls(true);
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }

      controlsTimeoutRef.current = setTimeout(() => {
        if (isCallConnected) {
          setShowControls(false);
        }
      }, 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isCallActive, isCallConnected]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (!isCallActive) return null;

  const caller = currentCall?.caller || otherUser;
  const receiver = currentCall?.receiver || otherUser;
  const displayUser = caller?._id !== otherUser?._id ? caller : receiver;

  return (
    <Dialog
      open={isCallActive}
      fullScreen
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          overflow: 'hidden',
        },
      }}
    >
      <Box
        ref={containerRef}
        sx={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
          cursor: showControls ? 'default' : 'none',
        }}
      >
        {/* Remote Video (Full Screen) */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {callType === 'video' ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            // Audio call - show avatar
            <Box sx={{ textAlign: 'center', color: 'white' }}>
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <Avatar
                  src={displayUser?.avatar?.url}
                  sx={{
                    width: 200,
                    height: 200,
                    margin: '0 auto',
                    mb: 3,
                    border: '8px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                  }}
                >
                  {displayUser?.name?.[0]?.toUpperCase()}
                </Avatar>
              </motion.div>
              
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {displayUser?.name || 'Unknown'}
              </Typography>
              
              <Typography variant="h6" sx={{ opacity: 0.8 }}>
                {isCallConnected ? formatDuration(callDuration) : 'Calling...'}
              </Typography>
            </Box>
          )}

          {/* No video placeholder for video calls */}
          {callType === 'video' && !isCallConnected && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(0,0,0,0.7)',
                color: 'white',
                zIndex: 1,
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Avatar
                  src={displayUser?.avatar?.url}
                  sx={{
                    width: 150,
                    height: 150,
                    margin: '0 auto',
                    mb: 2,
                  }}
                >
                  {displayUser?.name?.[0]?.toUpperCase()}
                </Avatar>
                
                <Typography variant="h5" gutterBottom>
                  {displayUser?.name || 'Unknown'}
                </Typography>
                
                <Typography variant="body1" sx={{ opacity: 0.8 }}>
                  Connecting...
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* Local Video (Picture in Picture) */}
        {callType === 'video' && (
          <Zoom in={isCallActive}>
            <Paper
              elevation={10}
              sx={{
                position: 'absolute',
                top: 20,
                right: 20,
                width: { xs: 120, sm: 200 },
                height: { xs: 160, sm: 280 },
                borderRadius: 3,
                overflow: 'hidden',
                zIndex: 10,
                bgcolor: '#1e293b',
                border: '3px solid rgba(255,255,255,0.2)',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  border: '3px solid rgba(255,255,255,0.4)',
                },
              }}
            >
              {isVideoOff ? (
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#334155',
                    color: 'white',
                  }}
                >
                  <VideocamOffIcon sx={{ fontSize: 48, opacity: 0.5 }} />
                </Box>
              ) : (
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)', // Mirror effect
                  }}
                />
              )}
            </Paper>
          </Zoom>
        )}

        {/* Top Info Bar */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)',
                  p: 3,
                  zIndex: 20,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    src={displayUser?.avatar?.url}
                    sx={{ width: 40, height: 40 }}
                  >
                    {displayUser?.name?.[0]?.toUpperCase()}
                  </Avatar>
                  
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" color="white" fontWeight="bold">
                      {displayUser?.name || 'Unknown'}
                    </Typography>
                    
                    <Typography variant="caption" color="white" sx={{ opacity: 0.8 }}>
                      {isCallConnected ? formatDuration(callDuration) : 'Connecting...'}
                    </Typography>
                  </Box>

                  {callType === 'video' && (
                    <IconButton
                      onClick={toggleFullscreen}
                      sx={{
                        color: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.2)',
                        },
                      }}
                    >
                      <FullscreenIcon />
                    </IconButton>
                  )}
                </Stack>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Controls */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                  p: 4,
                  zIndex: 20,
                }}
              >
                <Stack
                  direction="row"
                  spacing={3}
                  justifyContent="center"
                  alignItems="center"
                >
                  {/* Mute/Unmute Audio */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <IconButton
                      onClick={toggleAudio}
                      sx={{
                        width: 60,
                        height: 60,
                        bgcolor: isAudioMuted ? '#ef4444' : 'rgba(255,255,255,0.2)',
                        color: 'white',
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                          bgcolor: isAudioMuted ? '#dc2626' : 'rgba(255,255,255,0.3)',
                        },
                      }}
                    >
                      {isAudioMuted ? (
                        <MicOffIcon sx={{ fontSize: 28 }} />
                      ) : (
                        <MicIcon sx={{ fontSize: 28 }} />
                      )}
                    </IconButton>
                  </motion.div>

                  {/* End Call */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 135 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <IconButton
                      onClick={endCall}
                      sx={{
                        width: 70,
                        height: 70,
                        bgcolor: '#ef4444',
                        color: 'white',
                        '&:hover': {
                          bgcolor: '#dc2626',
                          transform: 'scale(1.1)',
                        },
                      }}
                    >
                      <CallEndIcon sx={{ fontSize: 32 }} />
                    </IconButton>
                  </motion.div>

                  {/* Toggle Video (only for video calls) */}
                  {callType === 'video' && (
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <IconButton
                        onClick={toggleVideo}
                        sx={{
                          width: 60,
                          height: 60,
                          bgcolor: isVideoOff ? '#ef4444' : 'rgba(255,255,255,0.2)',
                          color: 'white',
                          backdropFilter: 'blur(10px)',
                          '&:hover': {
                            bgcolor: isVideoOff ? '#dc2626' : 'rgba(255,255,255,0.3)',
                          },
                        }}
                      >
                        {isVideoOff ? (
                          <VideocamOffIcon sx={{ fontSize: 28 }} />
                        ) : (
                          <VideocamIcon sx={{ fontSize: 28 }} />
                        )}
                      </IconButton>
                    </motion.div>
                  )}
                </Stack>

                {/* Control Labels */}
                <Stack
                  direction="row"
                  spacing={3}
                  justifyContent="center"
                  sx={{ mt: 2 }}
                >
                  <Typography variant="caption" color="white" sx={{ width: 60, textAlign: 'center' }}>
                    {isAudioMuted ? 'Unmute' : 'Mute'}
                  </Typography>
                  
                  <Typography variant="caption" color="white" sx={{ width: 70, textAlign: 'center' }}>
                    End Call
                  </Typography>
                  
                  {callType === 'video' && (
                    <Typography variant="caption" color="white" sx={{ width: 60, textAlign: 'center' }}>
                      {isVideoOff ? 'Camera On' : 'Camera Off'}
                    </Typography>
                  )}
                </Stack>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Connection Status Indicator */}
        {!isCallConnected && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 30,
              textAlign: 'center',
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            >
              <Typography variant="h6" color="white">
                Connecting...
              </Typography>
            </motion.div>
          </Box>
        )}
      </Box>
    </Dialog>
  );
};

export default ActiveCallDialog;

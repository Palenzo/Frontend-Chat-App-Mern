import { Dialog, Stack, IconButton, Typography, Box, Avatar } from '@mui/material';
import {
  CallEnd as CallEndIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
} from '@mui/icons-material';
import { useWebRTC } from '../../context/WebRTCContext';
import { useEffect, useRef } from 'react';

const VideoCallDialog = ({ open }) => {
  const {
    currentCall,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    callDuration,
    endCall,
    toggleMute,
    toggleVideo,
  } = useWebRTC();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Attach local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach remote stream to video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (!currentCall) return null;

  const otherUser = currentCall.isCaller ? currentCall.receiver : currentCall.caller;
  const isVideoCall = currentCall.type === 'video';

  return (
    <Dialog
      open={open}
      fullScreen
      PaperProps={{
        sx: {
          backgroundColor: '#1a1a1a',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Remote Video (Full Screen) */}
      <Box
        sx={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000',
        }}
      >
        {isVideoCall && remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        ) : (
          // Audio call or no video - show avatar
          <Stack alignItems="center" spacing={2}>
            <Avatar
              src={otherUser?.avatar?.url}
              alt={otherUser?.name}
              sx={{ width: 150, height: 150 }}
            />
            <Typography variant="h4" color="white">
              {otherUser?.name}
            </Typography>
            <Typography variant="body1" color="grey.400">
              {remoteStream ? 'Connected' : 'Connecting...'}
            </Typography>
          </Stack>
        )}

        {/* Local Video (Picture-in-Picture) */}
        {isVideoCall && localStream && (
          <Box
            sx={{
              position: 'absolute',
              top: 20,
              right: 20,
              width: 200,
              height: 150,
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              backgroundColor: '#000',
            }}
          >
            {isVideoOff ? (
              <Stack
                alignItems="center"
                justifyContent="center"
                sx={{ width: '100%', height: '100%', backgroundColor: '#333' }}
              >
                <Avatar src={currentCall.caller?.avatar?.url} sx={{ width: 60, height: 60 }} />
                <Typography variant="caption" color="white" mt={1}>
                  Camera Off
                </Typography>
              </Stack>
            ) : (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)', // Mirror effect
                }}
              />
            )}
          </Box>
        )}

        {/* Call Info Overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            left: 20,
            backgroundColor: 'rgba(0,0,0,0.6)',
            padding: '12px 20px',
            borderRadius: 2,
            backdropFilter: 'blur(10px)',
          }}
        >
          <Typography variant="h6" color="white">
            {otherUser?.name}
          </Typography>
          <Typography variant="body2" color="grey.300">
            {callDuration}
          </Typography>
        </Box>
      </Box>

      {/* Call Controls */}
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={3}
        sx={{
          padding: 4,
          backgroundColor: 'rgba(0,0,0,0.9)',
        }}
      >
        {/* Mute/Unmute */}
        <IconButton
          onClick={toggleMute}
          sx={{
            backgroundColor: isMuted ? '#f44336' : 'rgba(255,255,255,0.1)',
            color: 'white',
            '&:hover': {
              backgroundColor: isMuted ? '#d32f2f' : 'rgba(255,255,255,0.2)',
            },
            width: 56,
            height: 56,
          }}
        >
          {isMuted ? <MicOffIcon /> : <MicIcon />}
        </IconButton>

        {/* End Call */}
        <IconButton
          onClick={endCall}
          sx={{
            backgroundColor: '#f44336',
            color: 'white',
            '&:hover': {
              backgroundColor: '#d32f2f',
            },
            width: 64,
            height: 64,
          }}
        >
          <CallEndIcon sx={{ fontSize: 32 }} />
        </IconButton>

        {/* Video On/Off (only for video calls) */}
        {isVideoCall && (
          <IconButton
            onClick={toggleVideo}
            sx={{
              backgroundColor: isVideoOff ? '#f44336' : 'rgba(255,255,255,0.1)',
              color: 'white',
              '&:hover': {
                backgroundColor: isVideoOff ? '#d32f2f' : 'rgba(255,255,255,0.2)',
              },
              width: 56,
              height: 56,
            }}
          >
            {isVideoOff ? <VideocamOffIcon /> : <VideocamIcon />}
          </IconButton>
        )}
      </Stack>
    </Dialog>
  );
};

export default VideoCallDialog;

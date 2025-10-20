import React from 'react';
import {
  StreamCall,
  StreamTheme,
  SpeakerLayout,
  CallControls,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import { Box, IconButton, Typography } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import '@stream-io/video-react-sdk/dist/css/styles.css';

const VideoCallUI = ({ call, onEndCall, otherUserName, callDuration, formatDuration }) => {
  if (!call) return null;

  return (
    <StreamCall call={call}>
      <StreamTheme>
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: '#1a1a1a',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 10000,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)',
              padding: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography variant="h6" color="white" fontWeight="bold">
                {otherUserName || 'Call in Progress'}
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.7)">
                {formatDuration(callDuration)}
              </Typography>
            </Box>
            <IconButton
              onClick={onEndCall}
              sx={{
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.2)',
                },
              }}
            >
              <CloseIcon sx={{ color: 'white' }} />
            </IconButton>
          </Box>

          {/* Video Layout */}
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SpeakerLayout participantsBarPosition="bottom" />
          </Box>

          {/* Call Controls */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 10000,
              background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, transparent 100%)',
              padding: 3,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <CallControls onLeave={onEndCall} />
          </Box>
        </Box>
      </StreamTheme>
    </StreamCall>
  );
};

export default VideoCallUI;

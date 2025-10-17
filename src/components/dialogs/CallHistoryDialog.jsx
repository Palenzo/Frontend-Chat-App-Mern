import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Typography,
  Box,
  Chip,
  Stack,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  CallMade as CallMadeIcon,
  CallReceived as CallReceivedIcon,
  CallMissed as CallMissedIcon,
  Videocam as VideocamIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { server } from '../../constants/config';
import toast from 'react-hot-toast';
import moment from 'moment';
import { motion, AnimatePresence } from 'framer-motion';

const CallHistoryDialog = ({ open, onClose, chatId, user }) => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCallHistory();
    }
  }, [open, chatId]);

  const fetchCallHistory = async () => {
    try {
      setLoading(true);
      const endpoint = chatId
        ? `${server}/api/v1/call/history/${chatId}`
        : `${server}/api/v1/call/my-history`;

      const { data } = await axios.get(endpoint, {
        withCredentials: true,
      });

      setCalls(data.calls || []);
    } catch (error) {
      console.error('Error fetching call history:', error);
      toast.error('Failed to fetch call history');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return 'Not connected';
    
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const getCallIcon = (call) => {
    const isCaller = call.caller._id === user._id;
    const isVideoCall = call.callType === 'video';

    if (call.status === 'missed' || call.status === 'rejected') {
      return <CallMissedIcon sx={{ color: '#ef4444' }} />;
    }

    if (isCaller) {
      return isVideoCall ? (
        <VideocamIcon sx={{ color: '#10b981' }} />
      ) : (
        <CallMadeIcon sx={{ color: '#10b981' }} />
      );
    }

    return isVideoCall ? (
      <VideocamIcon sx={{ color: '#3b82f6' }} />
    ) : (
      <CallReceivedIcon sx={{ color: '#3b82f6' }} />
    );
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      accepted: { label: 'Completed', color: 'success' },
      ended: { label: 'Ended', color: 'success' },
      rejected: { label: 'Rejected', color: 'error' },
      missed: { label: 'Missed', color: 'warning' },
      unavailable: { label: 'Unavailable', color: 'default' },
      initiated: { label: 'Initiated', color: 'info' },
    };

    const config = statusConfig[status] || { label: status, color: 'default' };

    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}
      />
    );
  };

  const getOtherUser = (call) => {
    return call.caller._id === user._id ? call.receiver : call.caller;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '80vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Call History
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 300,
            }}
          >
            <CircularProgress />
          </Box>
        ) : calls.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 3,
            }}
          >
            <PhoneIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No call history
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your call history will appear here
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            <AnimatePresence>
              {calls.map((call, index) => {
                const otherUser = getOtherUser(call);
                const isCaller = call.caller._id === user._id;

                return (
                  <motion.div
                    key={call._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ListItem
                      sx={{
                        py: 2,
                        px: 3,
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Box sx={{ position: 'relative' }}>
                          <Avatar
                            src={otherUser.avatar?.url}
                            sx={{
                              width: 50,
                              height: 50,
                            }}
                          >
                            {otherUser.name?.[0]?.toUpperCase()}
                          </Avatar>
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: -2,
                              right: -2,
                              bgcolor: 'background.paper',
                              borderRadius: '50%',
                              p: 0.3,
                            }}
                          >
                            {getCallIcon(call)}
                          </Box>
                        </Box>
                      </ListItemAvatar>

                      <ListItemText
                        primary={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold">
                              {otherUser.name || 'Unknown'}
                            </Typography>
                            {call.chat?.groupChat && (
                              <Chip
                                label={call.chat.name}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Stack>
                        }
                        secondary={
                          <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {moment(call.createdAt).format('MMM DD, YYYY • hh:mm A')}
                            </Typography>
                            
                            <Stack direction="row" spacing={1} alignItems="center">
                              {getStatusChip(call.status)}
                              
                              {(call.status === 'accepted' || call.status === 'ended') && (
                                <Typography variant="caption" color="text.secondary">
                                  Duration: {formatDuration(call.duration)}
                                </Typography>
                              )}
                            </Stack>
                          </Stack>
                        }
                      />
                    </ListItem>
                    
                    {index < calls.length - 1 && <Divider />}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CallHistoryDialog;

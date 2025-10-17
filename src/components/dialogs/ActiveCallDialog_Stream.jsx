import React from 'react';
import { useCall } from '../../context/CallContext';
import VideoCallUI from '../specific/VideoCallUI';

const ActiveCallDialog = () => {
  const {
    activeCall,
    otherUser,
    callDuration,
    formatDuration,
    endCall,
  } = useCall();

  if (!activeCall) return null;

  return (
    <VideoCallUI
      call={activeCall}
      onEndCall={endCall}
      otherUserName={otherUser?.name}
      callDuration={callDuration}
      formatDuration={formatDuration}
    />
  );
};

export default ActiveCallDialog;

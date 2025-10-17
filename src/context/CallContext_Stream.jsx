import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useStreamVideo } from './StreamVideoContext';
import { getSocket } from '../socket';
import { server } from '../constants/config';
import axios from 'axios';
import {
  CALL_INITIATED,
  CALL_ACCEPTED,
  CALL_REJECTED,
  CALL_ENDED,
  CALL_UNAVAILABLE,
  INCOMING_CALL,
} from '../constants/events';
import toast from 'react-hot-toast';

const CallContext = createContext();

export const useCall = () => useContext(CallContext);

export const CallProvider = ({ children, user }) => {
  const { client: streamClient } = useStreamVideo();
  const socket = getSocket();
  
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [currentCall, setCurrentCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null); // Active Stream Call object
  const [otherUser, setOtherUser] = useState(null);
  const [callDuration, setCallDuration] = useState(0);

  // Format call duration
  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Initiate a call
  const initiateCall = useCallback(async (chatId, receiverId, callType, receiverName) => {
    try {
      if (!streamClient) {
        toast.error('Video service not initialized');
        return;
      }

      console.log('🎥 Initiating call:', { chatId, receiverId, callType, receiverName });

      // Generate unique call ID
      const callId = `call-${chatId}-${Date.now()}`;

      // Create call on backend
      const { data } = await axios.post(
        `${server}/api/v1/call/initiate`,
        { chatId, receiverId, callType },
        { withCredentials: true }
      );

      // Create Stream call
      const call = streamClient.call(callType, callId);
      
      // Set custom data
      await call.getOrCreate({
        ring: true,
        data: {
          custom: {
            chatId,
            callerId: user._id,
            callerName: user.name,
            receiverId,
            receiverName,
          },
        },
      });

      setActiveCall(call);
      setCurrentCall({
        ...data.call,
        callId,
        receiverName,
        callType,
      });

      // Notify via socket
      socket.emit(CALL_INITIATED, {
        chatId,
        receiverId,
        callType,
        callId,
        callerName: user.name,
      });

      toast.success(`Calling ${receiverName}...`);
    } catch (error) {
      console.error('Call initiation error:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate call');
    }
  }, [streamClient, socket, user]);

  // Accept incoming call
  const acceptCall = useCallback(async (callData) => {
    try {
      if (!streamClient) {
        toast.error('Video service not initialized');
        return;
      }

      console.log('📞 Accepting call:', callData);

      // Join the Stream call
      const call = streamClient.call(callData.callType, callData.callId);
      await call.join();

      setActiveCall(call);
      setIsIncomingCall(false);
      setCurrentCall(callData);

      // Notify backend
      await axios.post(
        `${server}/api/v1/call/accept/${callData._id}`,
        {},
        { withCredentials: true }
      );

      // Notify via socket
      socket.emit(CALL_ACCEPTED, {
        callId: callData.callId,
        userId: callData.caller,
      });

      toast.success('Call connected');
    } catch (error) {
      console.error('Accept call error:', error);
      toast.error('Failed to accept call');
    }
  }, [streamClient, socket]);

  // Reject incoming call
  const rejectCall = useCallback(async (callData) => {
    try {
      console.log('❌ Rejecting call:', callData);

      // Notify backend
      await axios.post(
        `${server}/api/v1/call/reject/${callData._id}`,
        {},
        { withCredentials: true }
      );

      // Notify via socket
      socket.emit(CALL_REJECTED, {
        callId: callData.callId,
        userId: callData.caller,
      });

      setIsIncomingCall(false);
      setCurrentCall(null);
      setOtherUser(null);

      toast.success('Call rejected');
    } catch (error) {
      console.error('Reject call error:', error);
      toast.error('Failed to reject call');
    }
  }, [socket]);

  // End active call
  const endCall = useCallback(async () => {
    try {
      console.log('🔴 Ending call');

      if (activeCall) {
        await activeCall.leave();
        setActiveCall(null);
      }

      if (currentCall) {
        // Notify backend
        await axios.post(
          `${server}/api/v1/call/end/${currentCall._id}`,
          {},
          { withCredentials: true }
        );

        // Notify via socket
        socket.emit(CALL_ENDED, {
          callId: currentCall.callId,
          userId: currentCall.receiver === user._id ? currentCall.caller : currentCall.receiver,
        });
      }

      setCurrentCall(null);
      setOtherUser(null);
      setCallDuration(0);

      toast.success('Call ended');
    } catch (error) {
      console.error('End call error:', error);
      toast.error('Failed to end call');
      
      // Force cleanup
      if (activeCall) {
        await activeCall.leave();
      }
      setActiveCall(null);
      setCurrentCall(null);
      setOtherUser(null);
    }
  }, [activeCall, currentCall, socket, user]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    // Incoming call
    socket.on(INCOMING_CALL, (data) => {
      console.log('📲 Incoming call:', data);
      setIsIncomingCall(true);
      setCurrentCall(data.call);
      setOtherUser({
        _id: data.call.caller,
        name: data.callerName,
      });
    });

    // Call accepted
    socket.on(CALL_ACCEPTED, async (data) => {
      console.log('✅ Call accepted:', data);
      if (activeCall) {
        // Other user accepted, start call
        await activeCall.join();
        toast.success('Call connected');
      }
    });

    // Call rejected
    socket.on(CALL_REJECTED, () => {
      console.log('❌ Call rejected by other user');
      toast.error('Call was rejected');
      endCall();
    });

    // Call ended
    socket.on(CALL_ENDED, () => {
      console.log('🔴 Call ended by other user');
      toast.info('Call ended');
      endCall();
    });

    // Call unavailable
    socket.on(CALL_UNAVAILABLE, (data) => {
      console.log('📵 User unavailable:', data);
      toast.error(data.message || 'User is unavailable');
      endCall();
    });

    return () => {
      socket.off(INCOMING_CALL);
      socket.off(CALL_ACCEPTED);
      socket.off(CALL_REJECTED);
      socket.off(CALL_ENDED);
      socket.off(CALL_UNAVAILABLE);
    };
  }, [socket, activeCall, endCall]);

  // Track call duration
  useEffect(() => {
    let interval;
    if (activeCall) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeCall]);

  const value = {
    // State
    isIncomingCall,
    currentCall,
    activeCall,
    otherUser,
    callDuration,
    isCallActive: !!activeCall,
    
    // Actions
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    
    // Utilities
    formatDuration,
  };

  return (
    <CallContext.Provider value={value}>
      {children}
    </CallContext.Provider>
  );
};

import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { getSocket } from '../socket';
import {
  CALL_INITIATED,
  CALL_ACCEPTED,
  CALL_REJECTED,
  CALL_ENDED,
  CALL_UNAVAILABLE,
  INCOMING_CALL,
  WEBRTC_OFFER,
  WEBRTC_ANSWER,
  WEBRTC_ICE_CANDIDATE,
} from '../constants/events';
import toast from 'react-hot-toast';

const WebRTCContext = createContext();

export const useWebRTC = () => {
  const context = useContext(WebRTCContext);
  if (!context) {
    throw new Error('useWebRTC must be used within WebRTCProvider');
  }
  return context;
};

// STUN servers for NAT traversal
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export const WebRTCProvider = ({ children, user }) => {
  const socket = getSocket();

  // Call state
  const [isCallActive, setIsCallActive] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [currentCall, setCurrentCall] = useState(null);
  const [callType, setCallType] = useState('video'); // 'video' or 'audio'
  
  // Stream state
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  
  // Control state
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Refs
  const peerConnection = useRef(null);
  const callTimer = useRef(null);

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  // Start call timer
  const startCallTimer = () => {
    callTimer.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  // Stop call timer
  const stopCallTimer = () => {
    if (callTimer.current) {
      clearInterval(callTimer.current);
      callTimer.current = null;
    }
    setCallDuration(0);
  };

  // Format duration (MM:SS or HH:MM:SS)
  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get user media stream
  const getUserMedia = async (type) => {
    try {
      const constraints = {
        video: type === 'video' ? { width: 1280, height: 720 } : false,
        audio: true,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast.error('Failed to access camera/microphone');
      throw error;
    }
  };

  // ============================================
  // PEER CONNECTION SETUP
  // ============================================

  const createPeerConnection = (otherUserId, callId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnection.current = pc;

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit(WEBRTC_ICE_CANDIDATE, {
          candidate: event.candidate,
          userId: otherUserId,
          callId,
        });
      }
    };

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('Remote track received:', event.streams[0]);
      setRemoteStream(event.streams[0]);
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setIsCallActive(true);
        startCallTimer();
        toast.success('Call connected!');
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        endCall();
      }
    };

    return pc;
  };

  // ============================================
  // CALL INITIATION (CALLER SIDE)
  // ============================================

  const initiateCall = async (receiverId, receiver, type = 'video') => {
    try {
      console.log('Initiating call to:', receiver.name);
      setCallType(type);

      // Get local media stream
      const stream = await getUserMedia(type);
      setLocalStream(stream);

      // Generate call ID
      const callId = `${user._id}-${receiverId}-${Date.now()}`;

      // Setup call state
      setCurrentCall({
        callId,
        receiver,
        receiverId,
        type,
        isCaller: true,
      });

      // Create peer connection
      const pc = createPeerConnection(receiverId, callId);

      // Add local stream tracks to peer connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Emit call initiation to backend
      socket.emit(CALL_INITIATED, {
        callId,
        receiverId,
        callType: type,
      });

      // Send WebRTC offer
      socket.emit(WEBRTC_OFFER, {
        offer,
        receiverId,
        callId,
      });

      console.log('Call initiated, waiting for answer...');
    } catch (error) {
      console.error('Error initiating call:', error);
      toast.error('Failed to initiate call');
      cleanup();
    }
  };

  // ============================================
  // CALL ACCEPTANCE (RECEIVER SIDE)
  // ============================================

  const acceptCall = async () => {
    try {
      if (!incomingCall) return;

      console.log('Accepting call from:', incomingCall.caller.name);
      setCallType(incomingCall.callType);
      setCurrentCall({
        callId: incomingCall.callId,
        caller: incomingCall.caller,
        callerId: incomingCall.caller._id,
        type: incomingCall.callType,
        isCaller: false,
      });

      // Get local media stream
      const stream = await getUserMedia(incomingCall.callType);
      setLocalStream(stream);

      // Create peer connection
      const pc = createPeerConnection(incomingCall.caller._id, incomingCall.callId);

      // Add local stream tracks
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Set remote description (offer from caller)
      if (incomingCall.offer) {
        await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
      }

      // Create and send answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Send answer to caller
      socket.emit(WEBRTC_ANSWER, {
        answer,
        callerId: incomingCall.caller._id,
        callId: incomingCall.callId,
      });

      // Notify backend that call was accepted
      socket.emit(CALL_ACCEPTED, {
        callId: incomingCall.callId,
        callerId: incomingCall.caller._id,
      });

      // Clear incoming call state
      setIncomingCall(null);

      console.log('Call accepted, answer sent');
    } catch (error) {
      console.error('Error accepting call:', error);
      toast.error('Failed to accept call');
      cleanup();
    }
  };

  // ============================================
  // CALL REJECTION
  // ============================================

  const rejectCall = () => {
    if (!incomingCall) return;

    console.log('Rejecting call from:', incomingCall.caller.name);

    socket.emit(CALL_REJECTED, {
      callId: incomingCall.callId,
      callerId: incomingCall.caller._id,
    });

    setIncomingCall(null);
    toast('Call rejected', { icon: '📵' });
  };

  // ============================================
  // CALL ENDING
  // ============================================

  const endCall = () => {
    if (!currentCall) return;

    console.log('Ending call');

    // Notify the other user
    const otherUserId = currentCall.isCaller ? currentCall.receiverId : currentCall.callerId;
    socket.emit(CALL_ENDED, {
      callId: currentCall.callId,
      userId: otherUserId,
    });

    cleanup();
    toast('Call ended', { icon: '📞' });
  };

  // ============================================
  // CLEANUP
  // ============================================

  const cleanup = () => {
    console.log('Cleaning up call resources');

    // Stop all tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    // Close peer connection
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    // Stop timer
    stopCallTimer();

    // Reset state
    setIsCallActive(false);
    setCurrentCall(null);
    setRemoteStream(null);
    setIsMuted(false);
    setIsVideoOff(false);
  };

  // ============================================
  // MEDIA CONTROLS
  // ============================================

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  // ============================================
  // SOCKET EVENT HANDLERS
  // ============================================

  useEffect(() => {
    if (!socket) return;

    // Incoming call notification
    socket.on(INCOMING_CALL, ({ callId, caller, callType }) => {
      console.log('Incoming call from:', caller.name);
      setIncomingCall({ callId, caller, callType, offer: null });
      toast(`Incoming ${callType} call from ${caller.name}`, { icon: '📞', duration: 10000 });
    });

    // WebRTC Offer received (with incoming call)
    socket.on(WEBRTC_OFFER, ({ offer, callerId, callId }) => {
      console.log('WebRTC offer received');
      setIncomingCall((prev) => (prev ? { ...prev, offer } : null));
    });

    // WebRTC Answer received (caller receives this)
    socket.on(WEBRTC_ANSWER, async ({ answer, receiverId, callId }) => {
      console.log('WebRTC answer received');
      try {
        if (peerConnection.current) {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        }
      } catch (error) {
        console.error('Error setting remote description:', error);
      }
    });

    // ICE Candidate received
    socket.on(WEBRTC_ICE_CANDIDATE, async ({ candidate, userId, callId }) => {
      console.log('ICE candidate received');
      try {
        if (peerConnection.current) {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    });

    // Call accepted (caller receives this)
    socket.on(CALL_ACCEPTED, ({ callId, receiverId }) => {
      console.log('Call accepted by receiver');
      toast.success('Call accepted!');
    });

    // Call rejected
    socket.on(CALL_REJECTED, ({ callId, receiverId }) => {
      console.log('Call rejected');
      toast.error('Call was rejected');
      cleanup();
    });

    // Call ended by other user
    socket.on(CALL_ENDED, ({ callId }) => {
      console.log('Call ended by other user');
      toast('Call ended', { icon: '📞' });
      cleanup();
    });

    // User unavailable
    socket.on(CALL_UNAVAILABLE, ({ message }) => {
      console.log('User unavailable:', message);
      toast.error(message || 'User is not available');
      cleanup();
    });

    return () => {
      socket.off(INCOMING_CALL);
      socket.off(WEBRTC_OFFER);
      socket.off(WEBRTC_ANSWER);
      socket.off(WEBRTC_ICE_CANDIDATE);
      socket.off(CALL_ACCEPTED);
      socket.off(CALL_REJECTED);
      socket.off(CALL_ENDED);
      socket.off(CALL_UNAVAILABLE);
    };
  }, [socket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value = {
    // State
    isCallActive,
    incomingCall,
    currentCall,
    callType,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    callDuration: formatDuration(callDuration),
    
    // Actions
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
  };

  return <WebRTCContext.Provider value={value}>{children}</WebRTCContext.Provider>;
};

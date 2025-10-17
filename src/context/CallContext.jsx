import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
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
  WEBRTC_OFFER,
  WEBRTC_ANSWER,
  WEBRTC_ICE_CANDIDATE,
} from '../constants/events';
import toast from 'react-hot-toast';

const CallContext = createContext();

export const useCall = () => useContext(CallContext);

// WebRTC Configuration
const rtcConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // Add TURN server for production
    // {
    //   urls: 'turn:your-turn-server.com:3478',
    //   username: 'username',
    //   credential: 'password'
    // }
  ],
};

export const CallProvider = ({ children, user }) => {
  const socket = getSocket();
  
  const [isCallActive, setIsCallActive] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [currentCall, setCurrentCall] = useState(null);
  const [callType, setCallType] = useState(null); // 'video' or 'audio'
  const [isCallConnected, setIsCallConnected] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [otherUser, setOtherUser] = useState(null);

  const peerConnectionRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const callTimerRef = useRef(null);

  // Initialize call timer
  useEffect(() => {
    if (isCallConnected) {
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      setCallDuration(0);
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [isCallConnected]);

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

  // Setup peer connection
  const setupPeerConnection = useCallback((otherUserId, callId) => {
    const peerConnection = new RTCPeerConnection(rtcConfiguration);
    peerConnectionRef.current = peerConnection;

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit(WEBRTC_ICE_CANDIDATE, {
          candidate: event.candidate,
          userId: otherUserId,
          callId: callId,
        });
      }
    };

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log('Received remote track:', event);
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setRemoteStream(event.streams[0]);
      }
    };

    // Connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.connectionState);
      
      if (peerConnection.connectionState === 'connected') {
        setIsCallConnected(true);
        toast.success('Call connected');
      } else if (peerConnection.connectionState === 'failed') {
        toast.error('Connection failed');
        endCall();
      }
    };

    // ICE connection state changes
    peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', peerConnection.iceConnectionState);
    };

    return peerConnection;
  }, [socket]);

  // Get user media
  const getUserMedia = async (type) => {
    try {
      const constraints = {
        video: type === 'video' ? { width: 1280, height: 720 } : false,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast.error('Could not access camera/microphone');
      throw error;
    }
  };

  // Initiate call
  const initiateCall = async (chatId, receiverId, type, receiverName) => {
    try {
      setCallType(type);
      setOtherUser({ _id: receiverId, name: receiverName });

      // Call API to create call record
      const { data } = await axios.post(
        `${server}/api/v1/call/initiate`,
        { chatId, receiverId, callType: type },
        { withCredentials: true }
      );

      setCurrentCall(data.call);
      setIsCallActive(true);

      // Get user media
      const stream = await getUserMedia(type);

      // Create peer connection
      const peerConnection = setupPeerConnection(receiverId, data.call._id);

      // Add local tracks
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      // Create and send offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      socket.emit(WEBRTC_OFFER, {
        offer: offer,
        receiverId: receiverId,
        callId: data.call._id,
      });

      socket.emit(CALL_INITIATED, {
        callId: data.call._id,
        receiverId: receiverId,
        callType: type,
      });

      toast.success('Calling...');
    } catch (error) {
      console.error('Error initiating call:', error);
      toast.error(error?.response?.data?.message || 'Failed to initiate call');
      cleanupCall();
    }
  };

  // Accept call
  const acceptCall = async () => {
    try {
      if (!currentCall) return;

      const call = currentCall.call || currentCall;
      const callerId = call.caller._id;

      // Call API to accept
      await axios.post(
        `${server}/api/v1/call/accept`,
        { callId: call._id },
        { withCredentials: true }
      );

      // Get user media
      const stream = await getUserMedia(call.callType);

      // Create peer connection
      const peerConnection = setupPeerConnection(callerId, call._id);

      // Add local tracks
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      setIsIncomingCall(false);
      setIsCallActive(true);

      // Emit acceptance
      socket.emit(CALL_ACCEPTED, {
        callId: call._id,
        callerId: callerId,
      });

      toast.success('Call accepted');
    } catch (error) {
      console.error('Error accepting call:', error);
      toast.error('Failed to accept call');
      cleanupCall();
    }
  };

  // Reject call
  const rejectCall = async () => {
    try {
      if (!currentCall) return;

      const call = currentCall.call || currentCall;

      await axios.post(
        `${server}/api/v1/call/reject`,
        { callId: call._id },
        { withCredentials: true }
      );

      socket.emit(CALL_REJECTED, {
        callId: call._id,
        callerId: call.caller._id,
      });

      cleanupCall();
      toast.success('Call rejected');
    } catch (error) {
      console.error('Error rejecting call:', error);
      cleanupCall();
    }
  };

  // End call
  const endCall = async () => {
    try {
      if (!currentCall) {
        cleanupCall();
        return;
      }

      const call = currentCall.call || currentCall;
      const otherUserId = call.caller._id === user._id ? call.receiver._id : call.caller._id;

      await axios.post(
        `${server}/api/v1/call/end`,
        { callId: call._id },
        { withCredentials: true }
      );

      socket.emit(CALL_ENDED, {
        callId: call._id,
        userId: otherUserId,
      });

      cleanupCall();
      toast.success('Call ended');
    } catch (error) {
      console.error('Error ending call:', error);
      cleanupCall();
    }
  };

  // Cleanup call resources
  const cleanupCall = () => {
    // Stop all tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Clear video refs
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setRemoteStream(null);
    setCurrentCall(null);
    setIsCallActive(false);
    setIsIncomingCall(false);
    setIsCallConnected(false);
    setIsAudioMuted(false);
    setIsVideoOff(false);
    setCallDuration(0);
    setOtherUser(null);
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    // Incoming call
    socket.on(INCOMING_CALL, (data) => {
      console.log('Incoming call:', data);
      setCurrentCall(data);
      setIsIncomingCall(true);
      setCallType(data.call.callType);
      setOtherUser(data.call.caller);
    });

    // Call accepted
    socket.on(CALL_ACCEPTED, (data) => {
      console.log('Call accepted:', data);
      setIsCallConnected(true);
    });

    // Call rejected
    socket.on(CALL_REJECTED, (data) => {
      console.log('Call rejected:', data);
      toast.error('Call rejected');
      cleanupCall();
    });

    // Call ended
    socket.on(CALL_ENDED, (data) => {
      console.log('Call ended:', data);
      toast.info('Call ended');
      cleanupCall();
    });

    // User unavailable
    socket.on(CALL_UNAVAILABLE, (data) => {
      console.log('User unavailable:', data);
      toast.error('User is not available');
      cleanupCall();
    });

    // WebRTC Offer
    socket.on(WEBRTC_OFFER, async (data) => {
      try {
        if (!peerConnectionRef.current) return;
        
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(data.offer)
        );

        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);

        socket.emit(WEBRTC_ANSWER, {
          answer: answer,
          callerId: data.callerId,
          callId: data.callId,
        });
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    });

    // WebRTC Answer
    socket.on(WEBRTC_ANSWER, async (data) => {
      try {
        if (!peerConnectionRef.current) return;
        
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    });

    // ICE Candidate
    socket.on(WEBRTC_ICE_CANDIDATE, async (data) => {
      try {
        if (!peerConnectionRef.current) return;
        
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );
      } catch (error) {
        console.error('Error handling ICE candidate:', error);
      }
    });

    return () => {
      socket.off(INCOMING_CALL);
      socket.off(CALL_ACCEPTED);
      socket.off(CALL_REJECTED);
      socket.off(CALL_ENDED);
      socket.off(CALL_UNAVAILABLE);
      socket.off(WEBRTC_OFFER);
      socket.off(WEBRTC_ANSWER);
      socket.off(WEBRTC_ICE_CANDIDATE);
    };
  }, [socket, user]);

  const value = {
    isCallActive,
    isIncomingCall,
    currentCall,
    callType,
    isCallConnected,
    localStream,
    remoteStream,
    isAudioMuted,
    isVideoOff,
    callDuration,
    otherUser,
    localVideoRef,
    remoteVideoRef,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo,
    formatDuration,
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};

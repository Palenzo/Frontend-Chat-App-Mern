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

// STUN/TURN servers for NAT traversal and better connectivity
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 10,
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
  const pendingCandidates = useRef([]);
  const connectionTimeout = useRef(null);
  const isConnecting = useRef(false);

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
      console.log('🎥 Requesting media access:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ Media access granted, tracks:', stream.getTracks().map(t => t.kind));
      return stream;
    } catch (error) {
      console.error('❌ Error accessing media devices:', error);
      console.error('Error name:', error.name, 'Message:', error.message);
      toast.error('Failed to access camera/microphone');
      throw error;
    }
  };

  // ============================================
  // PEER CONNECTION SETUP
  // ============================================

  const createPeerConnection = (otherUserId, callId) => {
    try {
      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnection.current = pc;

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('Sending ICE candidate');
          socket.emit(WEBRTC_ICE_CANDIDATE, {
            candidate: event.candidate,
            userId: otherUserId,
            callId,
          });
        } else {
          console.log('ICE gathering complete');
        }
      };

      // Handle ICE connection state
      pc.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', pc.iceConnectionState);
        
        if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
          console.log('ICE connection established');
          clearTimeout(connectionTimeout.current);
        } else if (pc.iceConnectionState === 'failed') {
          console.error('ICE connection failed');
          toast.error('Connection failed. Please try again.');
          setTimeout(() => endCall(), 1000);
        } else if (pc.iceConnectionState === 'disconnected') {
          console.warn('ICE connection disconnected');
          toast.warning('Connection lost. Attempting to reconnect...');
        }
      };

      // Handle remote stream
      pc.ontrack = (event) => {
        console.log('Remote track received:', event.streams[0]);
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log('Peer connection state:', pc.connectionState);
        
        if (pc.connectionState === 'connected') {
          setIsCallActive(true);
          isConnecting.current = false;
          startCallTimer();
          toast.success('Call connected!');
          clearTimeout(connectionTimeout.current);
          
          // Process pending ICE candidates
          if (pendingCandidates.current.length > 0) {
            console.log('Processing pending ICE candidates:', pendingCandidates.current.length);
            pendingCandidates.current.forEach(candidate => {
              pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(err => {
                console.error('Error adding pending ICE candidate:', err);
              });
            });
            pendingCandidates.current = [];
          }
        } else if (pc.connectionState === 'disconnected') {
          console.warn('Peer connection disconnected');
        } else if (pc.connectionState === 'failed') {
          console.error('Peer connection failed');
          toast.error('Call connection failed');
          endCall();
        } else if (pc.connectionState === 'closed') {
          console.log('Peer connection closed');
        }
      };

      // Handle negotiation needed
      pc.onnegotiationneeded = async () => {
        console.log('Negotiation needed');
      };

      return pc;
    } catch (error) {
      console.error('Error creating peer connection:', error);
      toast.error('Failed to create connection');
      throw error;
    }
  };

  // ============================================
  // CALL INITIATION (CALLER SIDE)
  // ============================================

  const initiateCall = async (receiverId, receiver, type = 'video') => {
    // Prevent multiple simultaneous calls
    if (isConnecting.current || peerConnection.current) {
      console.log('⚠️ Already in a call or connecting');
      toast.error('Already in a call');
      return;
    }

    try {
      console.log('📞 Step 1: Initiating call to:', receiver.name);
      isConnecting.current = true;
      setCallType(type);

      // Generate call ID first
      const callId = `${user._id}-${receiverId}-${Date.now()}`;
      console.log('📞 Step 2: Call ID generated:', callId);

      // Setup call state early
      setCurrentCall({
        callId,
        receiver,
        receiverId,
        type,
        isCaller: true,
      });
      console.log('📞 Step 3: Call state set');

      // Get local media stream
      console.log('📞 Step 4: Getting user media...');
      const stream = await getUserMedia(type);
      setLocalStream(stream);
      console.log('📞 Step 5: Local stream set');

      // Create peer connection BEFORE adding tracks
      console.log('📞 Step 6: Creating peer connection...');
      const pc = createPeerConnection(receiverId, callId);
      console.log('📞 Step 7: Peer connection created, state:', pc.signalingState);

      // Verify peer connection is in correct state
      if (pc.signalingState === 'closed') {
        throw new Error('Peer connection closed unexpectedly after creation');
      }

      // Add local stream tracks to peer connection
      console.log('📞 Step 8: Adding tracks to peer connection...');
      stream.getTracks().forEach((track) => {
        console.log('  ➕ Adding track:', track.kind);
        pc.addTrack(track, stream);
      });
      console.log('📞 Step 9: All tracks added');

      // Set connection timeout AFTER peer connection is created
      console.log('📞 Step 10: Setting connection timeout...');
      connectionTimeout.current = setTimeout(() => {
        if (peerConnection.current && 
            peerConnection.current.connectionState !== 'connected') {
          console.error('⏱️ Connection timeout');
          toast.error('Connection timeout. Please try again.');
          endCall();
        }
      }, 30000);

      // Wait briefly for tracks to be added
      console.log('📞 Step 11: Waiting for track setup...');
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log('📞 Step 12: Track setup complete');

      // Verify peer connection is still valid before creating offer
      console.log('📞 Step 13: Verifying peer connection state:', 
        peerConnection.current ? peerConnection.current.signalingState : 'null');
      
      if (!peerConnection.current || pc.signalingState === 'closed') {
        throw new Error('Peer connection was closed before offer creation');
      }

      // Create and send offer
      console.log('📞 Step 14: Creating offer...');
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: type === 'video',
      });
      console.log('📞 Step 15: Offer created');
      
      await pc.setLocalDescription(offer);
      console.log('📞 Step 16: Offer set as local description');

      // Emit call initiation to backend
      console.log('📞 Step 17: Emitting CALL_INITIATED event...');
      socket.emit(CALL_INITIATED, {
        callId,
        receiverId,
        callType: type,
      });

      // Send WebRTC offer
      console.log('📞 Step 18: Sending WebRTC offer...');
      socket.emit(WEBRTC_OFFER, {
        offer,
        receiverId,
        callId,
      });

      console.log('✅ Call initiated successfully, waiting for answer...');
      toast.loading('Calling...', { duration: 3000 });
    } catch (error) {
      console.error('❌ Error initiating call at step:', error);
      console.error('Stack trace:', error.stack);
      
      // More specific error messages
      if (error.name === 'NotAllowedError') {
        toast.error('Camera/Microphone access denied');
      } else if (error.name === 'NotFoundError') {
        toast.error('Camera/Microphone not found');
      } else if (error.message?.includes('closed')) {
        toast.error('Connection error. Please try again.');
      } else {
        toast.error('Failed to initiate call');
      }
      
      isConnecting.current = false;
      cleanup(true); // Force cleanup on error
    }
  };

  // ============================================
  // CALL ACCEPTANCE (RECEIVER SIDE)
  // ============================================

  const acceptCall = async () => {
    try {
      if (!incomingCall) return;
      if (isConnecting.current) {
        console.log('Already connecting to a call');
        return;
      }

      console.log('Accepting call from:', incomingCall.caller.name);
      isConnecting.current = true;
      
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

      // Set connection timeout (30 seconds)
      connectionTimeout.current = setTimeout(() => {
        if (!peerConnection.current || 
            peerConnection.current.connectionState !== 'connected') {
          console.error('Connection timeout');
          toast.error('Connection timeout. Please try again.');
          endCall();
        }
      }, 30000);

      // Create peer connection
      const pc = createPeerConnection(incomingCall.caller._id, incomingCall.callId);

      // Add local stream tracks
      stream.getTracks().forEach((track) => {
        console.log('Adding track:', track.kind);
        pc.addTrack(track, stream);
      });

      // Set remote description (offer from caller)
      if (incomingCall.offer) {
        console.log('Setting remote description from offer');
        await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
      } else {
        console.warn('No offer found in incoming call');
      }

      // Wait a bit for setup
      await new Promise(resolve => setTimeout(resolve, 300));

      // Create and send answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      console.log('Answer created and set as local description');

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
      toast.success('Call accepted');
    } catch (error) {
      console.error('Error accepting call:', error);
      toast.error('Failed to accept call');
      isConnecting.current = false;
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

    cleanup(true); // Force cleanup
    toast('Call ended', { icon: '📞' });
  };

  // ============================================
  // CLEANUP
  // ============================================

  const cleanup = useCallback((force = false) => {
    // Don't cleanup if we're in the middle of establishing a connection
    // unless forced
    if (!force && isConnecting.current && !isCallActive) {
      console.log('Skipping cleanup - call is still being established');
      return;
    }

    console.log('Cleaning up call resources');

    // Clear timeouts
    if (connectionTimeout.current) {
      clearTimeout(connectionTimeout.current);
      connectionTimeout.current = null;
    }

    // Stop all tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop();
        console.log('Stopped track:', track.kind);
      });
      setLocalStream(null);
    }

    // Close peer connection
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
      console.log('Peer connection closed');
    }

    // Stop timer
    stopCallTimer();

    // Clear pending candidates
    pendingCandidates.current = [];

    // Reset flags
    isConnecting.current = false;

    // Reset state
    setIsCallActive(false);
    setCurrentCall(null);
    setRemoteStream(null);
    setIsMuted(false);
    setIsVideoOff(false);
  }, [localStream, isCallActive]);

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
    socket.on(WEBRTC_OFFER, ({ offer }) => {
      console.log('WebRTC offer received');
      setIncomingCall((prev) => (prev ? { ...prev, offer } : null));
    });

    // WebRTC Answer received (caller receives this)
    socket.on(WEBRTC_ANSWER, async ({ answer }) => {
      console.log('WebRTC answer received');
      try {
        if (peerConnection.current && !peerConnection.current.remoteDescription) {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
          console.log('Remote description set from answer');
          
          // Process pending ICE candidates
          if (pendingCandidates.current.length > 0) {
            console.log('Processing pending ICE candidates after answer');
            for (const candidate of pendingCandidates.current) {
              await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
            pendingCandidates.current = [];
          }
        }
      } catch (error) {
        console.error('Error setting remote description:', error);
      }
    });

    // ICE Candidate received
    socket.on(WEBRTC_ICE_CANDIDATE, async ({ candidate }) => {
      console.log('ICE candidate received');
      try {
        if (peerConnection.current && peerConnection.current.remoteDescription) {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
          console.log('ICE candidate added successfully');
        } else {
          // Queue candidate if remote description not set yet
          console.log('Queuing ICE candidate, remote description not set');
          pendingCandidates.current.push(candidate);
        }
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    });

    // Call accepted (caller receives this)
    socket.on(CALL_ACCEPTED, () => {
      console.log('Call accepted by receiver');
      toast.success('Call accepted!');
    });

    // Call rejected
    socket.on(CALL_REJECTED, () => {
      console.log('Call rejected');
      toast.error('Call was rejected');
      cleanup(true); // Force cleanup
    });

    // Call ended by other user
    socket.on(CALL_ENDED, () => {
      console.log('Call ended by other user');
      toast('Call ended', { icon: '📞' });
      cleanup(true); // Force cleanup
    });

    // User unavailable
    socket.on(CALL_UNAVAILABLE, ({ message }) => {
      console.log('User unavailable:', message);
      toast.error(message || 'User is not available');
      cleanup(true); // Force cleanup
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
  }, [socket, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup(true); // Force cleanup on unmount
    };
  }, [cleanup]);

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

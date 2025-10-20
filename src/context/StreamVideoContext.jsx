import React, { createContext, useContext, useEffect, useState } from 'react';
import { StreamVideoClient } from '@stream-io/video-react-sdk';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { server } from '../constants/config';
import toast from 'react-hot-toast';

const StreamVideoContext = createContext(null);

export const useStreamVideo = () => {
  const context = useContext(StreamVideoContext);
  if (!context) {
    throw new Error('useStreamVideo must be used within StreamVideoProvider');
  }
  return context;
};

export const StreamVideoProvider = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeClient = async () => {
      if (!user) {
        setClient(null);
        setIsLoading(false);
        return;
      }

      try {
        // Get Stream token from backend
        const { data } = await axios.get(`${server}/api/v1/user/stream-token`, {
          withCredentials: true,
        });

        const { token, apiKey } = data;

        // Create user object for Stream
        const streamUser = {
          id: user._id,
          name: user.name,
          image: user.avatar?.url,
        };

        // Initialize Stream Video Client
        const videoClient = new StreamVideoClient({
          apiKey,
          user: streamUser,
          token,
        });

        setClient(videoClient);
        console.log('✅ Stream Video Client initialized');
      } catch (error) {
        console.error('Failed to initialize Stream client:', error);
        toast.error('Failed to initialize video calling');
      } finally {
        setIsLoading(false);
      }
    };

    initializeClient();

    // Cleanup on unmount
    return () => {
      if (client) {
        client.disconnectUser();
        setClient(null);
      }
    };
  }, [user]);

  return (
    <StreamVideoContext.Provider value={{ client, isLoading }}>
      {children}
    </StreamVideoContext.Provider>
  );
};

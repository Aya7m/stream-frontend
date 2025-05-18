import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { toast } from "react-hot-toast";
import PageLoader from '../components/PageLoader';

import "@stream-io/video-react-sdk/dist/css/styles.css";
const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;
const CallPage = () => {
  const { id: callId } = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [streamToken, setStreamToken] = useState(null);
  const { user, loaging, token } = useAuth()
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const fetchStreamToken = async () => {
    try {
      setLoading(true);
      const response = await axios('https://stream-chat-backend-production.up.railway.app/chat-controller/stream-token', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
        timeout: 30000,
        
      });

      if (response.status === 200) {
        setStreamToken(response?.data.token);
        console.log('Stream Token:', response?.data.token);

      }
    } catch (error) {
      console.error('Error fetching stream token:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchStreamToken();
  }, []);


  useEffect(() => {
    const initCall = async () => {
      if (!streamToken || !user || !callId) return;
    
      try {
        console.log("Initializing Stream video client...");
    
        const currentUser = {
          id: user._id,
          name: user.fullname,
          image: user.profilePic,
        };
    
        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user: currentUser,
          token: streamToken,
        });
    
        const callInstance = videoClient.call("default", callId);
        await callInstance.join({ create: true });
    
        console.log("Joined call successfully");
    
        setClient(videoClient);
        setCall(callInstance);
      } catch (error) {
        console.error("Error joining call:", error);
        toast.error("Could not join the call. Please try again.");
      } finally {
        setIsConnecting(false);
      }
    };
    

    initCall();
  }, [streamToken, user, callId]);

  if (loading || isConnecting) return <PageLoader />;




  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="relative">
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>Could not initialize call. Please refresh or try again later.</p>
          </div>
        )}
      </div>
    </div>
  )
}


const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  const navigate = useNavigate();

  if (callingState === CallingState.LEFT) return navigate("/");

  return (
    <StreamTheme>
      <SpeakerLayout />
      <CallControls />
    </StreamTheme>
  );
};

export default CallPage
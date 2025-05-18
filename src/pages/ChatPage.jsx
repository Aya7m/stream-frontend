import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useParams } from 'react-router-dom';

import { StreamChat } from "stream-chat";
// import * as streamChat from 'stream-chat';





import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";



import toast from "react-hot-toast";
import ChatLoader from '../components/ChatLoader';
import CallButton from '../components/CallButton';


const ChatPage = () => {
  const { token, user } = useAuth();
  const [streamToken, setStreamToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { id: targetUserId } = useParams();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);

  const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY
  // fetch get getStreamToken

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

    const initChatClient = async () => {
      if (!streamToken) return;
      try {
        setLoading(true);
        console.log('Stream Token:', streamToken);
        console.log('Initializing chat client...');

        const chatClient = StreamChat.getInstance(STREAM_API_KEY);
        console.log('Chat client instance created:', chatClient);
        
        await chatClient.connectUser(
          {
            id: user._id,
            name: user.fullname,
            image: user.profilePic,
          },
          streamToken
        );

        const channalId = [user._id, targetUserId].sort().join("-");
        // you and me
        // if i start the chat with you =>channelId :[myId,yourId]
        // if you start the chat with me =>channelId :[yourId,myId]=>[myId,yourId]

        const currentChannel = chatClient.channel("messaging", channalId, {

          members: [user._id, targetUserId]
        });
        await currentChannel.watch();
        setChatClient(chatClient);
        setChannel(currentChannel);
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");
        setError(error);

      } finally {
        setLoading(false);
      }
    }

    initChatClient();
  }, [streamToken, targetUserId, user]);




  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });

      toast.success("Video call link sent successfully!");
    }
  };

  if (loading || !chatClient || !channel) {
    return (
      <ChatLoader />
    );
  }

  
  return (
    <div className="h-[93vh]">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative">
            <CallButton handleVideoCall={handleVideoCall} />
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  )
}

export default ChatPage
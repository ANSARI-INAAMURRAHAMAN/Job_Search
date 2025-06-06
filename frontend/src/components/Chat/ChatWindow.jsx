import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Context } from '../../main';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaPaperPlane, FaArrowLeft, FaUser, FaBriefcase } from 'react-icons/fa';
import API_BASE_URL from '../../config/api';
import './ChatWindow.css';

const ChatWindow = () => {
  const { applicationId } = useParams();
  const [chat, setChat] = useState(null);
  const [application, setApplication] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { user, isAuthorized } = useContext(Context);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isAuthorized) {
      navigate('/login');
      return;
    }

    fetchChat();
  }, [applicationId, isAuthorized]);

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  useEffect(() => {
    if (chat) {
      markAsRead();
    }
  }, [chat]);

  const fetchChat = async () => {
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/chat/${applicationId}`,
        { withCredentials: true }
      );
      setChat(data.chat);
      setApplication(data.application);
    } catch (error) {
      toast.error('Failed to load chat');
      console.error(error);
      navigate('/messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/chat/${applicationId}/message`,
        { content: message },
        { withCredentials: true }
      );
      setChat(data.chat);
      setMessage('');
    } catch (error) {
      toast.error('Failed to send message');
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/chat/${applicationId}/read`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOtherParticipant = () => {
    return chat?.participants?.find(p => p._id !== user._id);
  };

  if (loading) {
    return <div className="chat-loading">Loading chat...</div>;
  }

  if (!chat) {
    return <div className="chat-error">Chat not found</div>;
  }

  const otherUser = getOtherParticipant();

  return (
    <div className="chat-window">
      <div className="chat-header">
        <button onClick={() => navigate('/messages')} className="back-btn">
          <FaArrowLeft />
        </button>
        
        <div className="chat-info">
          <div className="participant-info">
            <FaUser />
            <div>
              <h3>{otherUser?.name}</h3>
              <span>{otherUser?.role}</span>
            </div>
          </div>
          
          <div className="application-info">
            <FaBriefcase />
            <span>{application?.jobTitle}</span>
          </div>
        </div>
      </div>

      <div className="messages-container">
        <div className="messages-list">
          {chat.messages?.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.sender._id === user._id ? 'sent' : 'received'}`}
            >
              <div className="message-content">
                <p>{msg.content}</p>
                <span className="message-time">{formatTime(msg.timestamp)}</span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={sendMessage} className="message-form">
        <div className="input-container">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={sending}
          />
          <button type="submit" disabled={!message.trim() || sending}>
            <FaPaperPlane />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
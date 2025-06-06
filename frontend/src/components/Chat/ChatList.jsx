import React, { useState, useEffect, useContext } from 'react';
import { Context } from '../../main';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaComments, FaUser, FaBriefcase, FaClock } from 'react-icons/fa';
import API_BASE_URL from '../../config/api';
import './ChatList.css';

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthorized } = useContext(Context);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthorized) {
      navigate('/login');
      return;
    }

    fetchChats();
  }, [isAuthorized, navigate]);

  const fetchChats = async () => {
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/chat`,
        { withCredentials: true }
      );
      setChats(data.chats);
    } catch (error) {
      toast.error('Failed to fetch chats');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getUnreadCount = (chat) => {
    return user?.role === 'Job Seeker' 
      ? chat.unreadCount?.applicant || 0
      : chat.unreadCount?.employer || 0;
  };

  const getOtherParticipant = (chat) => {
    return chat.participants?.find(p => p._id !== user._id);
  };

  if (loading) {
    return <div className="chat-loading">Loading chats...</div>;
  }

  return (
    <div className="chat-list-container">
      <div className="chat-list-header">
        <h1><FaComments /> Messages</h1>
        <p>Chat with applicants and employers about job applications</p>
      </div>

      {chats.length === 0 ? (
        <div className="no-chats">
          <FaComments size={60} />
          <h3>No messages yet</h3>
          <p>Start a conversation by applying for jobs or reviewing applications</p>
        </div>
      ) : (
        <div className="chats-grid">
          {chats.map((chat) => {
            const otherUser = getOtherParticipant(chat);
            const unreadCount = getUnreadCount(chat);
            
            return (
              <div
                key={chat._id}
                className={`chat-card ${unreadCount > 0 ? 'unread' : ''}`}
                onClick={() => navigate(`/chat/${chat.applicationId._id}`)}
              >
                <div className="chat-header">
                  <div className="participant-info">
                    <FaUser className="user-icon" />
                    <div>
                      <h3>{otherUser?.name}</h3>
                      <span className="user-role">{otherUser?.role}</span>
                    </div>
                  </div>
                  {unreadCount > 0 && (
                    <div className="unread-badge">{unreadCount}</div>
                  )}
                </div>

                <div className="job-info">
                  <FaBriefcase />
                  <span>{chat.applicationId?.jobTitle || 'Job Application'}</span>
                </div>

                {chat.lastMessage && (
                  <div className="last-message">
                    <p>{chat.lastMessage.content}</p>
                    <div className="message-time">
                      <FaClock />
                      {formatTime(chat.lastMessage.timestamp)}
                    </div>
                  </div>
                )}

                <div className="application-status">
                  <span className={`status ${chat.applicationId?.status?.toLowerCase()}`}>
                    {chat.applicationId?.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChatList;
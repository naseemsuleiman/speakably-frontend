import { useState, useEffect, useRef } from 'react';
import { FiX, FiSend, FiUsers, FiMessageSquare, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import Avatar from './Avatar';
import TimeAgo from 'react-timeago';
import API from '../utils/api';
import { toast } from 'react-toastify';

export default function CommunityModal({ community, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  const [members, setMembers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const messagesEndRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);

  // WebSocket setup
  useEffect(() => {
    if (!community) return;

    // Simulate WebSocket connection
    const connectWebSocket = () => {
      // In a real app, you would connect to an actual WebSocket server
      console.log('Connecting to WebSocket...');
      setIsConnected(true);
      
      // Simulate connection
      wsRef.current = {
        send: (data) => {
          console.log('Sending:', data);
          // Simulate message broadcast
          setTimeout(() => {
            if (data.type === 'message') {
              const newMsg = {
                id: Date.now(),
                content: data.content,
                user: { username: "Other User", id: Math.floor(Math.random() * 1000) + 10 },
                created_at: new Date().toISOString(),
                reply_to: data.reply_to || null
              };
              setMessages(prev => [...prev, newMsg]);
              scrollToBottom();
            }
          }, 500);
        },
        close: () => {
          console.log('Closing WebSocket...');
          setIsConnected(false);
        }
      };

      // Simulate receiving initial messages
      setTimeout(() => {
        const demoMessages = [
          {
            id: 1,
            content: "Welcome to the community!",
            user: { username: "admin", id: 1 },
            created_at: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 2,
            content: "Thanks! Happy to be here.",
            user: { username: "new_user", id: 2 },
            created_at: new Date(Date.now() - 1800000).toISOString(),
            reply_to: {
              id: 1,
              content: "Welcome to the community!",
              user: { username: "admin", id: 1 }
            }
          }
        ];
        setMessages(demoMessages);
        scrollToBottom();
      }, 300);

      // Simulate member updates
      const memberUpdateInterval = setInterval(() => {
        const action = Math.random() > 0.5 ? 'join' : 'leave';
        const randomUsername = `user${Math.floor(Math.random() * 1000)}`;
        
        if (action === 'join') {
          const newMember = {
            id: Date.now(),
            user: { username: randomUsername, id: Date.now() },
            joined_at: new Date().toISOString()
          };
          setMembers(prev => [...prev, newMember]);
          addNotification(`${randomUsername} joined the community`);
        } else if (members.length > 0) {
          const randomIndex = Math.floor(Math.random() * members.length);
          const leavingMember = members[randomIndex];
          setMembers(prev => prev.filter(m => m.id !== leavingMember.id));
          addNotification(`${leavingMember.user.username} left the community`);
        }
      }, 15000);

      return () => {
        clearInterval(memberUpdateInterval);
        if (wsRef.current) {
          wsRef.current.close();
        }
      };
    };

    connectWebSocket();
    fetchInitialData();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [community]);

  const fetchInitialData = async () => {
    try {
      // Simulated API calls
      const demoMembers = [
        {
          id: 1,
          user: { username: "admin", id: 1 },
          joined_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 2,
          user: { username: "moderator", id: 2 },
          joined_at: new Date(Date.now() - 43200000).toISOString()
        },
        {
          id: 3,
          user: { username: "member", id: 3 },
          joined_at: new Date(Date.now() - 21600000).toISOString()
        }
      ];
      setMembers(demoMembers);
    } catch (error) {
      console.error('Failed to load initial data', error);
    }
  };

  const addNotification = (text) => {
    const notification = {
      id: Date.now(),
      text,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [...prev, notification]);
    toast.info(text);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      // Create new message object
      const newMsg = {
        id: Date.now(),
        content: newMessage,
        user: { username: "You", id: 0 }, // Replace with actual user data
        created_at: new Date().toISOString(),
        reply_to: replyingTo ? {
          id: replyingTo.id,
          content: replyingTo.content,
          user: replyingTo.user
        } : null
      };
      
      // In a real app, you would send this via WebSocket
      if (wsRef.current) {
        wsRef.current.send({
          type: 'message',
          content: newMessage,
          reply_to: replyingTo
        });
      }
      
      // Optimistic update
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      setReplyingTo(null);
      scrollToBottom();
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  if (!community) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md h-[80vh] flex flex-col">
        {/* Header */}
        <div className="bg-pink-500 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowMembers(!showMembers)}
              className="p-1 hover:bg-pink-600 rounded-full"
              aria-label={showMembers ? "Hide members" : "Show members"}
            >
              <FiUsers size={20} />
            </button>
            <Avatar username={community.name} size={40} />
            <div>
              <h3 className="font-bold">{community.name}</h3>
              <p className="text-xs flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-400 mr-1"></span>
                {members.length} {members.length === 1 ? 'member' : 'members'} online
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <FiX size={24} />
          </button>
        </div>

        {/* Members List */}
        {showMembers && (
          <div className="bg-gray-50 p-4 border-b max-h-60 overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Community Members ({members.length})</h4>
              <button 
                onClick={() => setShowMembers(false)} 
                className="text-gray-500 hover:text-gray-700"
              >
                <FiChevronUp size={20} />
              </button>
            </div>
            <div className="space-y-3">
              {members.map(member => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar username={member.user.username} size={32} />
                    <div>
                      <p className="font-medium">{member.user.username}</p>
                      <p className="text-xs text-gray-500">
                        Joined <TimeAgo date={member.joined_at} />
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-green-500">
                    Online
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(message => (
            <div key={message.id} className="flex space-x-3">
              <div className="flex-shrink-0">
                <Avatar username={message.user.username} size={40} />
              </div>
              <div className="flex-1 min-w-0">
                {message.reply_to && (
                  <div className="text-xs text-gray-500 mb-1 pl-2 border-l-2 border-gray-300 truncate">
                    Replying to <span className="font-medium">{message.reply_to.user.username}</span>: {message.reply_to.content}
                  </div>
                )}
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-gray-900">
                      {message.user.username}
                      {message.user.id === 0 && <span className="ml-1 text-xs bg-pink-500 text-white px-1 rounded">You</span>}
                    </div>
                    <span className="text-xs text-gray-500">
                      <TimeAgo date={message.created_at} />
                    </span>
                  </div>
                  <p className="text-gray-800 mt-1 whitespace-pre-line break-words">
                    {message.content}
                  </p>
                  <div className="flex justify-end mt-1">
                    <button 
                      onClick={() => setReplyingTo(message)}
                      className="text-xs text-pink-500 hover:underline"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="px-4 space-y-1 max-h-20 overflow-y-auto">
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className="text-xs text-center text-gray-500 py-1 animate-fade-in bg-gray-50 rounded"
              >
                {notification.text}
              </div>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="border-t p-3">
          {replyingTo && (
            <div className="flex items-center justify-between bg-gray-100 p-2 rounded-t-lg mb-1">
              <div className="text-xs text-gray-600 truncate">
                Replying to <span className="font-medium">{replyingTo.user.username}</span>: {replyingTo.content}
              </div>
              <button 
                onClick={() => setReplyingTo(null)}
                className="text-xs text-gray-500 hover:text-gray-700 whitespace-nowrap ml-2"
              >
                Cancel
              </button>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={replyingTo ? `Reply to ${replyingTo.user.username}...` : "Type a message..."}
              className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="bg-pink-500 text-white p-2 rounded-full hover:bg-pink-600 disabled:opacity-50 transition-colors"
              aria-label="Send message"
            >
              <FiSend size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
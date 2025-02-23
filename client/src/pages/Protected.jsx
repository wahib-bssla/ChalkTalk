import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProtectedData, logout } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';

const Protected = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated, setIsAuthenticated } = useAuth();

  // Authentication check and data fetch
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      try {
        const response = await fetchProtectedData();
        setData(response);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch protected data');
        console.error('Error fetching protected data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, navigate]);

  // Socket.IO setup
  useEffect(() => {
    if (!isAuthenticated || !data?.user?.id) return;

    if (!socketRef.current) {
      socketRef.current = io('http://localhost:5000', {
        withCredentials: true,
        autoConnect: true,
      });

      const socket = socketRef.current;

      socket.on('connect', () => {
        console.log('🔗 Connected to server:', socket.id);
        socket.emit('saveSocketID', { userId: data.user.id });
      });

      socket.on('receiveMessage', (message) => {
        console.log('📥 New message received:', message);
        setMessages((prev) => [...prev, message]);
      });

      socket.on('connect_error', (err) => {
        console.error('Connection error:', err.message);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('receiveMessage');
        socketRef.current.off('connect_error');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, data]);

  // Send Message
  const handleSendMessage = () => {
    if (!socketRef.current || !message.trim() || !data?.user?.id) return;

    console.log('📤 Sending message:', { senderId: data.user.id, text: message });
    socketRef.current.emit('sendMessage', { senderId: data.user.id, text: message });
    setMessage('');
  };

  // Logout
  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false);
    navigate('/login');
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="protected-container">
      <h2>Protected Page</h2>
      {error && <p className="error-message">{error}</p>}

      {data?.user && (
        <div className="user-profile">
          <p>Welcome {data.user.username}!</p>
          <div className="user-details">
            <pre>{JSON.stringify(data.user, null, 2)}</pre>
          </div>
        </div>
      )}

      <div className="chat-interface">
        <h3>Live Chat</h3>
        <div className="message-list">
          {messages.map((msg) => (
            <div key={`msg-${msg.sender}-${msg.timestamp}`} className="message-bubble">
              <p className="message-content">{msg.sender} : {msg.text}</p>
            </div>
          ))}
        </div>

        <div className="message-composer">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={!isAuthenticated || !data?.user}
          />
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || !isAuthenticated || !data?.user}
          >
            Send
          </button>
        </div>
      </div>

      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Protected;
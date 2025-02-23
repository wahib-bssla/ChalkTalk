import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import {
  fetchProtectedData,
  getUsers,
  logout,
  getConversations,
} from "../utils/api";
import { useAuth } from "../context/AuthContext";
import ConversationListUI from "../components/conversationListUI";
import UserListUI from "../components/UserListUI";
import CreateGroupUI from "../components/CreateGroupUI";
import ChatInterface from "../components/ChatInterface";
import JoinGroupUI from "../components/JoinGroupUI";
import { IoEnter } from "react-icons/io5";
import axios from "axios";

const Home = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState("");
  const [conversationList, setConversationList] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userList, setUserList] = useState([]);
  const [showUserList, setShowUserList] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [receiverId, setReceiverId] = useState(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const [conversationTitle, setConversationTitle] = useState("");
  const [unreadConversations, setUnreadConversations] = useState({});
  const socketRef = useRef(null);
  const audioRef = useRef(new Audio("/notif.mp3"));

  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const URL = import.meta.env.VITE_URL

  // Authentication and data loading
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      try {
        const response = await fetchProtectedData();
        setData(response);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to fetch protected data"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, navigate]);

  // Load conversations
  const loadConversations = async (id) => {
    try {
      const response = await getConversations(id);
      const sorted = response.conversations.sort(
        (a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)
      );
      setConversationList(sorted);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch conversations");
    }
  };

  useEffect(() => {
    const checkUnreadMessages = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/chat/unread-messages`,
          {
            params: { userId: data.user.id },
            withCredentials: true,
          }
        );

        response.data.messages.forEach(({ message, conversationId }) => {
          const isTagged = new RegExp(`@${data.user.username}\\b`).test(
            message.message
          );

          setUnreadConversations((prev) => ({
            ...prev,
            [conversationId]: {
              count: (prev[conversationId]?.count || 0) + 1,
              isTagged: prev[conversationId]?.isTagged || isTagged,
            },
          }));
        });
      } catch (err) {
        console.error("Error fetching unread messages:", err);
      }
    };

    if (data?.user?.id) {
      checkUnreadMessages();
    }
  }, [data?.user?.id, data?.user?.username]);

  useEffect(() => {
    if (isAuthenticated && data?.user?.id) {
      loadConversations(data.user.id);
    }
  }, [isAuthenticated, data]);

  // WebSocket setup
  useEffect(() => {
    if (!isAuthenticated || !data?.user?.id) return;

    if (!socketRef.current) {
      socketRef.current = io(URL, {
        withCredentials: true,
        autoConnect: true,
      });

      socketRef.current.on("connect", () => {
        socketRef.current.emit("saveSocketID", { userId: data.user.id });
      });

      socketRef.current.on("connect_error", (err) => {
        console.error("Connection error:", err.message);
      });

      socketRef.current.on("groupCreated", (newGroup) => {
        if (newGroup.participants.includes(data.user.id)) {
          loadConversations(data.user.id);
        }
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, data?.user?.id]);

  // socket message handling and notifications
  useEffect(() => {
    const handleMessage = ({ message: newMessage, conversationId }) => {
      const isSender = newMessage.sender._id === data?.user?.id;
      const isActive = conversation === conversationId;
      const isTagged =
        new RegExp(`@${data?.user?.username}\\b`).test(newMessage.message) &&
        !isSender;

      // Update unread notifications
      if (!isSender && !isActive) {
        setUnreadConversations((prev) => ({
          ...prev,
          [conversationId]: {
            count: (prev[conversationId]?.count || 0) + 1,
            isTagged: prev[conversationId]?.isTagged || isTagged,
          },
        }));

        audioRef.current
          .play()
          .catch((err) => console.error("Audio error:", err));
      }

      // Handle new conversation creation
      if (!conversationList.some((conv) => conv._id === conversationId)) {
        loadConversations(data.user.id).then(() => {
          if (isSender) setConversation(conversationId);
        });
        return;
      }

      // Update conversation list
      setConversationList((prev) =>
        prev.map((conv) =>
          conv._id === conversationId
            ? {
                ...conv,
                messages: [...conv.messages, newMessage],
                lastUpdated: new Date(),
              }
            : conv
        )
      );

      // Update messages if in active conversation
      if (isActive) setMessages((prev) => [...prev, newMessage]);
    };

    socketRef.current?.on("receiveMessage", handleMessage);
    return () => {
      socketRef.current?.off("receiveMessage", handleMessage);
    };
  }, [data?.user?.id, conversation, conversationList]);

  // Update messages when conversation changes
  useEffect(() => {
    if (conversation && conversationList.length > 0) {
      const selectedConvo = conversationList.find(
        (conv) => conv._id === conversation
      );
      if (selectedConvo) {
        setMessages(selectedConvo.messages);
        const title =
          selectedConvo.type === "group"
            ? selectedConvo.name
            : selectedConvo.participants.find((p) => p._id !== data.user.id)
                ?.username;
        setConversationTitle(title || "");
      }
    }
  }, [conversation, conversationList, data?.user?.id]);

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await getUsers(data?.user?.id);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users");
    }
  };

  // UI Toggles
  const toggleUserList = async () => {
    if (showUserList) {
      setShowUserList(false);
      return;
    }
    try {
      const response = await fetchUsers();
      setUserList(response.user);
      setShowUserList(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users");
    }
  };

  const toggleCreateGroup = async () => {
    if (showCreateGroup) {
      setShowCreateGroup(false);
      return;
    }
    try {
      const response = await fetchUsers();
      setUserList(response.user);
      setShowCreateGroup(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users");
    }
  };

  const toggleJoinGroup = () => {
    setShowJoinGroup(!showJoinGroup);
  };

  // Message sending
  const handleSendMessage = () => {
    if (!message.trim() || !data?.user?.id) return;

    if (!socketRef.current) {
      console.error("Socket not initialized");
      return;
    }

    if (receiverId) {
      socketRef.current.emit("createPrivateConversation", {
        senderId: data.user.id,
        receiverId,
        text: message,
      });
    } else if (conversation) {
      socketRef.current.emit("sendMessage", {
        senderId: data.user.id,
        conversationId: conversation,
        text: message,
      });
    }

    setMessage("");
  };

  //in the 2 codes below, note that selecting a conversation deselect receiver and vice versa
  //so the message is either sent to an existing conversation => so it's using conversationId
  //or it is sent to a new conversation by sending a message to a user for the first time => so it's usinng receiverId
  //so conversationId and receiverId cannnot have a value bjouj at a time

  // Conversation selection
  const handleSelectConversation = (conversationId) => {
    const selectedConvo = conversationList.find(
      (conv) => conv._id === conversationId
    );
    setConversation(conversationId);
    setReceiverId("");
    setMessages(selectedConvo?.messages || []);
    setConversationTitle(
      selectedConvo?.type === "group"
        ? selectedConvo.name
        : selectedConvo?.participants.find((p) => p._id !== data.user.id)
            ?.username
    );

    // Clear red notifications
    setUnreadConversations((prev) => {
      const updated = { ...prev };
      delete updated[conversationId];
      return updated;
    });
    setShowMobileSidebar(false);
  };

  // Receiver selection
  const handleSelectReceiver = (userId, username) => {
    setReceiverId(userId);
    setConversation("");
    setMessages([]);
    setShowUserList(false);
    setConversationTitle(username);
    setShowMobileSidebar(false);
  };

  // Logout
  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false);
    navigate("/login");
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  // Sidebar content component
  const SidebarContent = () => (
    <div>
      <div className="flex justify-around mb-2 h-full">
        <UserListUI
          isVisible={showUserList}
          userList={userList}
          onToggle={toggleUserList}
          onSelectUser={handleSelectReceiver}
          conversationList={conversationList}
          currentUserId={data?.user?.id}
        />
        <CreateGroupUI
          socket={socketRef.current}
          userList={userList}
          userId={data.user.id}
          onGroupCreated={() => loadConversations(data.user.id)}
          isVisible={showCreateGroup}
          onToggle={toggleCreateGroup}
        />
        <JoinGroupUI
          userId={data?.user?.id}
          onJoinGroup={() => loadConversations(data.user.id)}
          isVisible={showJoinGroup}
          onToggle={toggleJoinGroup}
        />
      </div>
      <ConversationListUI
        conversationList={conversationList}
        handleSelectConversation={handleSelectConversation}
        userId={data.user.id}
        unreadConversations={unreadConversations}
      />
    </div>
  );

  const selectedConversation = conversationList.find(
    (conv) => conv._id === conversation
  );

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-teal-600 p-4 flex justify-between items-center shadow-md fixed w-full z-50">
        <div className="flex items-center gap-4">
          {/* Mobile menu button - shows on smaller screens */}
          <button
            className="lg:hidden text-white p-1 hover:bg-teal-700 rounded-lg transition-colors"
            onClick={() => setShowMobileSidebar(true)}
            aria-label="Open menu"
          >
            <svg
              className="w-6 h-6 text-teal-100"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Always visible title */}
          <div className="flex items-baseline gap-2">
            <h1 className="text-white text-2xl font-extrabold tracking-tight">
              ChalkTalk
            </h1>
          </div>
        </div>

        {/* Right section - always visible */}
        <div className="flex items-center gap-4">
          {/* User info - always visible */}
          <div className="flex items-center gap-2 bg-teal-700/30 px-3 py-1 rounded-full">
            <span className="text-teal-100 text-sm">Logged in as</span>
            <span className="text-white font-medium">{data.user.username}</span>
          </div>

          {/* Logout button - always visible with text */}
          <button
            className="flex items-center gap-2 bg-teal-700/30 hover:bg-teal-700/50 text-white px-3 py-1 rounded-full transition-colors group"
            onClick={handleLogout}
            aria-label="Log out"
          >
            <span className="text-sm font-bold">Log Out</span>
            <IoEnter className="w-5 h-5 transform group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 pt-16">
        <aside className="hidden lg:block w-1/4 p-4 border-r border-gray-300 bg-teal-100 overflow-y-auto">
          <SidebarContent />
        </aside>

        {showMobileSidebar && (
          <div className="fixed inset-0 z-50 flex lg:hidden bg-teal-100 hide-scrollbar">
            <div className="w-3/4 max-w-xs bg-teal-100 shadow-lg p-4 overflow-y-auto overflow-hidden hide-scrollbar">
              <button
                className="mb-4 text-xl font-bold"
                onClick={() => setShowMobileSidebar(false)}
              >
                &times;
              </button>
              <SidebarContent />
            </div>
            <div
              className="flex-grow"
              onClick={() => setShowMobileSidebar(false)}
            ></div>
          </div>
        )}

        <main className="flex-1 overflow-hidden flex flex-col">
          {conversation || receiverId ? (
            <ChatInterface
              conversationTitle={conversationTitle}
              messages={messages}
              data={data}
              message={message}
              setMessage={setMessage}
              handleSendMessage={handleSendMessage}
              isAuthenticated={isAuthenticated}
              isGroup={selectedConversation?.type === "group"}
              participants={selectedConversation?.participants}
              conversationId={conversation}
              subject={selectedConversation?.subject}
              isAdmin={selectedConversation?.admin === data.user.id}
              onExitConversation={() => {
                setConversation("");
                setReceiverId("");
                setMessages([]);
                setConversationTitle("");
              }}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-teal-100 p-4">
              <div className="text-center max-w-md">
                <h2 className="text-2xl font-bold text-emerald-900 mb-4">
                  Select a conversation to start chatting
                </h2>
                <p className="text-teal-700 mb-6">
                  Choose from your existing conversations or start a new one
                  using the menu on the left.
                </p>
                <button
                  onClick={() => setShowMobileSidebar(true)}
                  className="lg:hidden bg-teal-500 text-teal-100 px-6 py-3 rounded-lg hover:bg-teal-600 transition-colors font-bold"
                >
                  Open Conversations
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;

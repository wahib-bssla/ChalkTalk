import React, { useState, useRef, useEffect } from "react";
import { HiDotsHorizontal } from "react-icons/hi";
import { MdEmojiEmotions } from "react-icons/md";
import EmojiPicker from "emoji-picker-react";

const ChatInterface = ({
  conversationTitle,
  messages,
  data,
  message,
  setMessage,
  handleSendMessage,
  isAuthenticated,
  isGroup,
  participants,
  conversationId,
  subject,
  isAdmin,
  onExitConversation,
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedMessages, setSearchedMessages] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPicker, setShowPicker] = useState(false);
  const itemsPerPage = 5;

  const messagesContainerRef = useRef(null);

  // Reset search when conversation changes
  useEffect(() => {
    setSearchQuery("");
    setSearchedMessages([]);
    setCurrentSearchIndex(0);
  }, [conversationId]);

  // Auto-scroll to bottom when messages change wla when searchQuery is empty, kula useEffect dyal w7da
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);
  useEffect(() => {
    if (searchQuery.trim() === "" && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [searchQuery]);

  // scroll to searched message and highlight it
  useEffect(() => {
    if (searchedMessages.length > 0) {
      const messageId = searchedMessages[currentSearchIndex];
      const messageElement = document.getElementById(messageId);

      if (messageElement) {
        messageElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        messageElement.classList.add("bg-teal-700");
        setTimeout(() => {
          messageElement.classList.remove("bg-teal-700");
        }, 500);
      }
    }
  }, [searchedMessages, currentSearchIndex]);

  // Handle input with @pseudo
  const handleInputChange = (e) => {
    const text = e.target.value;
    setMessage(text);

    const tagging = text.match(/@(\w*)$/);
    if (tagging) {
      const query = tagging[1].toLowerCase();
      setFilteredParticipants(
        participants.filter((p) => p.username.toLowerCase().startsWith(query))
      );
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle selectinng user mn suggestions
  const handleSelectParticipant = (username) => {
    setMessage((prevMessage) => prevMessage.replace(/@\w*$/, `@${username} `));
    setShowSuggestions(false);
  };

  // Search functionality
  const handleSearchMessage = (e) => {
    const text = e.target.value.toLowerCase();
    setSearchQuery(text);

    if (text.trim() === "") {
      setSearchedMessages([]);
      setCurrentSearchIndex(0);
      return;
    }

    const msgs = messages.filter((msg) =>
      msg.message.toLowerCase().includes(text.trim())
    );
    const newSearchMessages = msgs.map((msg) => msg._id);
    setSearchedMessages(newSearchMessages);
    setCurrentSearchIndex(
      newSearchMessages.length > 0 ? newSearchMessages.length - 1 : 0
    );
  };

  // Search navigation
  const handleNextSearch = () => {
    setCurrentSearchIndex((prev) =>
      prev < searchedMessages.length - 1 ? prev + 1 : 0
    );
  };
  const handlePreviousSearch = () => {
    setCurrentSearchIndex((prev) =>
      prev > 0 ? prev - 1 : searchedMessages.length - 1
    );
  };

  // Pagination
  const totalPages = participants
    ? Math.ceil(participants.length / itemsPerPage)
    : 0;
  const paginatedParticipants = participants
    ? participants.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    )
    : [];

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Copy room id to clipboard
  const copyRoomId = () => {
    navigator.clipboard.writeText(conversationId);
  };

  return (
    <div className="bg-teal-100 flex flex-col h-[calc(100vh-4rem)] p-8">
      {/* Header Section */}
      <div className="pb-4">
        {/*Title and Info Icon */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h3 className="text-3xl font-extrabold text-emerald-900 flex items-center">
              {conversationTitle}
              {subject && (
                <span className="bg-teal-200 text-sm px-3 py-1 rounded-full text-teal-800 font-semibold ml-2 flex items-center">
                  {subject}
                </span>
              )}
            </h3>
          </div>
          <div className="flex items-center gap-4">
            {isGroup && isAdmin && (
              <button
                onClick={() => setShowInfo(true)}
                className="text-teal-900 px-4 py-2 text-2xl rounded-full hover:bg-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
              >
                <HiDotsHorizontal />
              </button>
            )}
            <button
              onClick={onExitConversation}
              className="text-teal-900 hover:bg-teal-300 p-2 rounded-full transition-colors text-2xl"
              aria-label="Exit conversation"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Search Bar Row */}
        <div className="mt-4">
          <div className="flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchMessage}
              placeholder="Search messages"
              disabled={!isAuthenticated || !data?.user}
              className="w-full border border-teal-400 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-teal-500 mr-2 text-emerald-950"
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchedMessages.length > 0) {
                  handleNextSearch();
                }
              }}
            />
            {searchedMessages.length > 0 && searchQuery.trim() !== "" && (
              <div className="flex items-center space-x-2 flex-nowrap">
                <span className="whitespace-nowrap text-sm text-teal-800">
                  {currentSearchIndex + 1} of {searchedMessages.length}
                </span>
                <button
                  onClick={handlePreviousSearch}
                  className="px-2 py-1 rounded-full hover:bg-teal-300 text-teal-900"
                  disabled={searchedMessages.length <= 1}
                >
                  ▲
                </button>
                <button
                  onClick={handleNextSearch}
                  className="px-2 py-1 rounded-full hover:bg-teal-300 text-teal-900"
                  disabled={searchedMessages.length <= 1}
                >
                  ▼
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Group Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-teal-100 p-6 rounded-lg max-w-md w-full">
            <h4 className="text-lg font-bold text-emerald-900 mb-4">
              Room Info
            </h4>
            <p className="mb-2">
              <strong className="text-emerald-900">Room ID:</strong>{" "}
              <span
                onClick={copyRoomId}
                className="ml-2 inline-block bg-teal-200 px-2 py-1 rounded-l-2xl cursor-pointer text-sm pr-0 text-teal-800 font-semibold"
                title="Click to copy"
              >
                {conversationId}
              </span>
              <span
                onClick={copyRoomId}
                className="bg-teal-200 cursor-pointer text-sm px-2 py-1 inline-block rounded-r-2xl pl-[3px] text-teal-800 font-semibold"
              >
                | Copy
              </span>
            </p>
            <p className="mb-2">
              <strong className="text-emerald-900">Subject:</strong>{" "}
              <span className="bg-teal-200 text-sm px-2 py-1 inline-block rounded-2xl text-teal-800 font-semibold">
                {subject}
              </span>
            </p>
            <h5 className="mb-2 text-emerald-900">
              <strong>Participants:</strong>
            </h5>
            <ul className="list-none space-y-2 mb-4 text-emerald-900">
              {paginatedParticipants.map((participant) => {
                const messageCount = messages.filter(
                  (msg) => msg.sender._id === participant._id
                ).length;
                return (
                  <li
                    key={participant._id}
                    className="flex items-center justify-between bg-teal-100 px-4 py-2 rounded-lg shadow-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">
                        {participant.username}
                      </span>
                      {participant._id === data?.user?.id && (
                        <span className="text-xs bg-teal-500 text-white px-2 py-1 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    <span className="text-xs bg-teal-300 text-teal-900 px-2 py-1 rounded-full">
                      {messageCount} {messageCount === 1 ? "msg" : "msgs"}
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="flex justify-between items-center mb-4">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-teal-300 text-teal-900 rounded disabled:opacity-50 hover:bg-teal-400 cursor-pointer"
              >
                Previous
              </button>
              <span className="text-teal-900">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-teal-300 text-teal-900 rounded disabled:opacity-50 hover:bg-teal-400 cursor-pointer"
              >
                Next
              </button>
            </div>
            <button
              onClick={() => setShowInfo(false)}
              className="w-full bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto hide-scrollbar space-y-2 mb-4"
      >
        {messages.map((msg) => (
          <div
            id={msg._id}
            key={msg._id}
            className={`p-3 rounded-lg max-w-[65%] min-w-[30%] break-words w-fit ${msg.sender._id === data.user.id
              ? "bg-teal-500 text-white self-start ml-auto"
              : "bg-teal-200 text-emerald-900 self-end mr-auto"
              }`}
          >
            <p className="text-sm font-medium">
              {isGroup
                ? msg.sender._id === data.user.id
                  ? ""
                  : msg.sender.username
                : ""}
            </p>
            <p className="text-base">
              {msg.message.split(/(@\w+)/g).map((part, index) => {
                if (part.startsWith("@")) {
                  const username = part.slice(1);
                  const isParticipant = participants.some(
                    (p) => p.username.toLowerCase() === username.toLowerCase()
                  );
                  return isParticipant ? (
                    <strong key={index}>{part}</strong>
                  ) : (
                    part
                  );
                } else {
                  return part;
                }
              })}
            </p>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="flex-shrink-0 flex items-center relative">
        <input
          type="text"
          value={message}
          onChange={handleInputChange}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          disabled={!isAuthenticated || !data?.user}
          className="flex-grow border border-teal-400 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-teal-500 mr-2 text-emerald-950"
        />
        {showSuggestions && (
          <div className="absolute bg-teal-100 border-3 border-teal-500 rounded-lg mt-1 w-48 max-h-40 overflow-y-auto bottom-12 hide-scrollbar">
            {filteredParticipants.map((participant) => (
              <div
                key={participant._id}
                onClick={() => handleSelectParticipant(participant.username)}
                className="p-2 hover:bg-teal-200 cursor-pointer text-emerald-950"
              >
                {participant.username}
              </div>
            ))}
          </div>
        )}
        {/* Emoji Picker Toggle Button */}
        <button
          onClick={() => setShowPicker(!showPicker)}
          className=" rounded-full hover:bg-teal-300 transition mr-2"
        >
          <MdEmojiEmotions className="w-10 h-10 text-teal-500 p-1 " />
        </button>

        {/* Emoji Picker */}
        {showPicker && (
          <div className="absolute bottom-12 right-0 z-50">
            <EmojiPicker
              height={400}
              width={400}
              emojiStyle={"twitter"}
              onEmojiClick={(e) =>
                setMessage((prevMessage) => prevMessage + e.emoji)
              }
              open={true}
            />
          </div>
        )}
        <button
          onClick={handleSendMessage}
          disabled={!message.trim() || !isAuthenticated || !data?.user}
          className="bg-teal-500 text-white rounded-lg px-4 py-2 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;

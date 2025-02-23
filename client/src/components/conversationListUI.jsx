import React, { useState } from "react";

const ConversationListUI = ({
  conversationList,
  handleSelectConversation,
  userId,
  unreadConversations,
}) => {

  const [searchTerm, setSearchTerm] = useState("");

  //when no convesastion is found
  if (!conversationList || conversationList.length === 0) {
    return (
      <p className="text-center text-gray-500">Start a new conversation</p>
    );
  }

  // Filter conversations by title, subject, wla last message.
  const filteredConversations = conversationList
    .filter((conv) => {
      const title =
        conv.type === "group"
          ? conv.name
          : conv.participants[0]._id === userId
          ? conv.participants[1].username
          : conv.participants[0].username;

      const lastMessage =
        conv?.messages && conv.messages.length
          ? conv.messages[conv.messages.length - 1].message
          : "";

      const subject = conv.type === "group" ? conv.subject : "";

      return (
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lastMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)); // Sort by lastUpdated

  return (
    <div className="h-[79vh] overflow-hidden flex flex-col">
      {/* Fixed Header) */}
      <div className="flex-shrink-0 p-4 bg-teal-100 ">
        <h2 className="text-3xl font-extrabold text-emerald-900 mb-2">
          Conversations
        </h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full px-3 py-2 border border-teal-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/*Conversation List */}
      <div className="flex-1 overflow-y-auto p-4 pt-0 hide-scrollbar">
        {filteredConversations.length === 0 ? (
          <p className="text-center text-gray-500">
            No matching conversations found
          </p>
        ) : (
          //displaying conversation list
          filteredConversations.map((conv) => {
            //some vars for each conversation
            const title =
              conv.type === "group"
                ? conv.name
                : conv.participants[0]._id === userId
                ? conv.participants[1].username
                : conv.participants[0].username;

            const lastMessage =
              conv?.messages && conv.messages.length
                ? conv.messages[conv.messages.length - 1].message
                : "‎"; //character khawi

            const subject = conv.type === "group" ? conv.subject : null;

            const unread = unreadConversations[conv._id];

            return (
              <div
                key={conv._id}
                className="border border-teal-400 rounded-lg mb-2 hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => handleSelectConversation(conv._id)}
                  className="w-full text-left p-4 bg-teal-100 rounded-lg hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl  font-bold text-emerald-900 truncate">
                          {title}
                        </span>
                        {subject && (
                          <span className="px-2 py-1 text-sm font-medium bg-teal-200 text-emerald-900 rounded-full flex-shrink-0">
                            {subject}
                          </span>
                        )}
                      </div>
                      {lastMessage && (
                        <span className="text-sm text-gray-600 truncate block mt-1">
                          {lastMessage}
                        </span>
                      )}
                    </div>

                    {unread && (
                      <div className="flex items-center gap-2 ml-3">
                        {unread.isTagged && (
                          <span className="text-xl font-bold text-teal-600">
                            @
                          </span>
                        )}
                        
                        {unread.count > 0 && (
                          <span className="bg-teal-600 text-teal-100 rounded-full px-2 py-1 text-sm font-bold">
                            {unread.count}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationListUI;

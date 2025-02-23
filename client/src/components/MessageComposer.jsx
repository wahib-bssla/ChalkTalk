import React from 'react';

const MessageComposer = ({ message, setMessage, handleSendMessage, isAuthenticated, data }) => {
    return (
        <div className="flex items-center space-x-2 p-4 border-t border-gray-300 bg-teal-100">
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={!isAuthenticated || !data?.user}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
                onClick={handleSendMessage}
                disabled={!message.trim() || !isAuthenticated || !data?.user}
                className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
                Send
            </button>
        </div>
    );
};

export default MessageComposer;

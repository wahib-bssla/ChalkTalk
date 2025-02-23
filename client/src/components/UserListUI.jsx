import { useEffect, useState } from "react";
import { IoPersonAdd } from "react-icons/io5";

const UserListUI = ({
  isVisible,
  userList,
  onToggle,
  onSelectUser,
  conversationList,
  currentUserId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);

  //filter to not show the current user, or users that he already have private conversations with
  const filteredUsers = userList
    .filter((user) => {
      const hasPrivateConvo = conversationList.some((conv) => {
        if (conv.type !== "private") return false;
        const participantIds = conv.participants.map((p) => p._id);
        return (
          participantIds.includes(currentUserId) &&
          participantIds.includes(user._id) &&
          participantIds.length === 2
        );
      });
      return !hasPrivateConvo;
    })
    .filter((user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );


  return (
    <>
      <div>
        <div className="relative flex items-center">
          <button
            onClick={onToggle}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="w-max h-10 bg-teal-500 text-white rounded hover:bg-teal-600 flex items-center justify-center flex-shrink-0 mx-2 xl:mx-3 px-5 xl:px-7 cursor-pointer"
          >
            <IoPersonAdd className="w-6 h-6" />
          </button>

          {/* Tooltip */}
          {showTooltip && (
            <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-teal-800 text-teal-100 text-sm px-2 py-1 rounded shadow-lg">
              New Private Conversation
            </div>
          )}
        </div>
      </div>

      {isVisible && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-teal-100 rounded-lg p-4 max-w-md w-full mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-extrabold text-emerald-900">
                New Conversation
              </h3>
              <button
                onClick={onToggle}
                className="text-emerald-900 hover:text-emerald-700 text-2xl"
              >
                &times;
              </button>
            </div>

            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border border-teal-400 rounded mb-4 text-emerald-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />

            {filteredUsers.length > 0 ? (
              <>
                <ul className="max-h-96 overflow-y-auto space-y-2 hide-scrollbar">
                  {filteredUsers.map((user) => (
                    <li
                      key={user._id}
                      onClick={() => onSelectUser(user._id, user.username)}
                      className="flex items-center justify-between bg-teal-100 px-4 py-2 rounded-lg shadow-sm cursor-pointer hover:bg-teal-200 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-emerald-900">
                          {user.username}
                        </span>
                        {user._id === currentUserId && (
                          <span className="text-xs bg-teal-500 text-white px-2 py-1 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-center text-emerald-900 py-4">
                No users found
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default UserListUI;

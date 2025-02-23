import { useState, useEffect } from "react";
import { BiSolidMessageSquareAdd } from "react-icons/bi";
import { MdAddToPhotos } from "react-icons/md";


const CreateGroupUI = ({ 
  socket, 
  userList, 
  userId, 
  onGroupCreated, 
  isVisible, 
  onToggle 
}) => {
  const [groupName, setGroupName] = useState("");
  const [groupSubject, setGroupSubject] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showTooltip, setShowTooltip] = useState(false);
  const usersPerPage = 5;

  //filter users with searchQuery
  const filteredUsers = userList.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  //Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  //reset page when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  //handle select user
  const handleUserSelect = (user) => {
    setSelectedUsers((prevSelected) =>
      prevSelected.includes(user._id)
        ? prevSelected.filter((id) => id !== user._id)
        : [...prevSelected, user._id]
    );
  };

  //handle create group button
  const handleCreateGroup = () => {
    if (!groupName.trim() || !groupSubject.trim()) {
      setError("Room must have a name and a subject.");
      return;
    }

    if (!socket) {
      setError("Socket connection error.");
      return;
    }

    //adding the creator and chatbot to the room
    const chatbotId = "67b9be5876dcba6411261d09";
    const groupParticipants = [...selectedUsers, userId, chatbotId];

    //use socket to emit to server bach ysawb room
    //then server will create the room in the db, and emit that a room was created to all online users
    //and (in clientside) it will cause the conversation list to reload if the user if a participant
    socket.emit("createGroupConversation", {
      name: groupName,
      subject: groupSubject,
      participants: groupParticipants,
      admin: userId,
    });
    
    //chttab
    setGroupName("");
    setGroupSubject("");
    setSelectedUsers([]);
    setError("");
    onGroupCreated();
    onToggle();
  };


  return (
    <div>
      <div className="relative flex items-center">
      <button
        onClick={onToggle}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="w-max h-10 bg-teal-500 text-white rounded hover:bg-teal-600 flex items-center justify-center flex-shrink-0 mx-2 xl:mx-3 px-5 xl:px-7 cursor-pointer"
      >
        <MdAddToPhotos className="w-6 h-6" />
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-teal-800 text-teal-100 text-sm px-2 py-1 rounded shadow-lg">
          New Room
        </div>
      )}
    </div>

      {isVisible && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-teal-100 rounded-lg shadow-md p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl  text-emerald-900 font-extrabold">Create Group</h3>
              <button
                onClick={onToggle}
                className="text-emerald-900 hover:text-emerald-700 text-2xl"
              >
                &times;
              </button>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <input
              type="text"
              placeholder="Room Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="border border-teal-400 rounded-lg p-2 mb-4 w-full focus:outline-none focus:ring-2 focus:ring-teal-500 text-emerald-900"
            />
            <input
              type="text"
              placeholder="Room Subject"
              value={groupSubject}
              onChange={(e) => setGroupSubject(e.target.value)}
              className="border border-teal-400 rounded-lg p-2 mb-4 w-full focus:outline-none focus:ring-2 focus:ring-teal-500 text-emerald-900"
            />

            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border border-teal-400 rounded mb-4 text-emerald-900 focus:ring-2 focus:ring-teal-500"
            />

            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedUsers.map((id) => {
                  const user = userList.find((u) => u._id === id);
                  return (
                    <span key={id} className="bg-teal-500 text-white px-2 py-1 rounded text-sm">
                      {user?.username}
                    </span>
                  );
                })}
              </div>
            )}

            {filteredUsers.length > 0 ? (
              <>
                <div className="user-list space-y-2 mb-4 max-h-60 overflow-y-auto">
                  {paginatedUsers.map((user) => (
                    <div key={user._id} className="user-item flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => handleUserSelect(user)}
                        className="mr-2 accent-teal-500"
                      />
                      <span className="text-emerald-900">{user.username}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-teal-300 text-teal-900 rounded hover:bg-teal-400 disabled:bg-teal-200 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-emerald-900">
                    Page {currentPage} of {totalPages || 1}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-teal-300 text-teal-900 rounded hover:bg-teal-400 disabled:bg-teal-200 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <p className="text-center text-emerald-900 py-4">No users found</p>
            )}

            <button
              onClick={handleCreateGroup}
              disabled={!groupName || !groupSubject }
              className="w-full bg-teal-500 text-white rounded-lg px-4 py-2 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 font-bold"
            >
              Create Room
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateGroupUI;
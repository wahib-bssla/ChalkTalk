import { useState } from "react";
import { IoAddCircle } from "react-icons/io5";
import { joinGroup } from "../utils/api";

const JoinGroupUI = ({ userId, onJoinGroup, isVisible, onToggle }) => {
  const [groupID, setGroupID] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);


  //handle joining a room
  const handleJoinGroup = async () => {
    if (!groupID.trim()) {
      setError("Please enter a valid Group ID");
      return;
    }

    try {
      const response = await joinGroup(userId, groupID);

      //chttab
      if (response.message === "Successfully joined the group") {
        setSuccess("Successfully joined the room!");
        setError("");
        setGroupID("");
        onJoinGroup(); // Refresh conversations
        setTimeout(() => onToggle(), 1500); // Close modal after 1.5s
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to join room");
      setSuccess("");
    }
  };

  return (
    <div>
      <div>
            <div className="relative flex items-center">
            <button
              onClick={onToggle}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="w-max h-10 bg-teal-500 text-white rounded hover:bg-teal-600 flex items-center justify-center flex-shrink-0 mx-2 xl:mx-3 px-5 xl:px-7 cursor-pointer"
            >
              <IoAddCircle className="w-6 h-6" />
            </button>
      
            {/* Tooltip */}
            {showTooltip && (
              <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-teal-800 text-teal-100 text-sm px-2 py-1 rounded shadow-lg">
                Join a Room
              </div>
            )}
          </div>
      </div>
      
      

      {/* Modal Popup */}
      {isVisible && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-teal-100 rounded-lg shadow-md p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl text-emerald-900 font-extrabold">Join Room</h3>
              <button
                onClick={onToggle}
                className="text-emerald-900 hover:text-emerald-700 text-2xl"
              >
                &times;
              </button>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}
            {success && <p className="text-green-500 mb-4">{success}</p>}

            <input
              type="text"
              placeholder="Enter Room ID"
              value={groupID}
              onChange={(e) => setGroupID(e.target.value)}
              className="border border-teal-400 rounded-lg p-2 mb-4 w-full focus:outline-none focus:ring-2 focus:ring-teal-500 text-emerald-900"
            />

            <button
              onClick={handleJoinGroup}
              disabled={!groupID}
              className="w-full bg-teal-500 text-white rounded-lg px-4 py-2 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 font-bold"
            >
              Join Room
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JoinGroupUI;
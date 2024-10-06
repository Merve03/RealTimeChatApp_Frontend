import { Routes, Route, Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from "../config/axiosConfig"; // Assuming you have a config for axios
import API_BASE_URL from "../config/config";

import AddFriendModal from "../modals/AddFriendModal";
import NewChatModal from "../modals/NewChatModal";
import FriendList from "../components/FriendList";
import PrivateChatList from "../components/PrivateChatList";
import GroupList from "../components/GroupList";

const UserPage = () => {
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [userDetails, setUserDetails] = useState({ fullname: "", email: "" }); // State to store user details
  const [loading, setLoading] = useState(true);

  const handleAddFriendClick = () => setShowAddFriendModal(true);
  const handleNewChatClick = () => setShowNewChatModal(true);
  const handleCloseAddFriendModal = () => setShowAddFriendModal(false);
  const handleCloseNewChatModal = () => setShowNewChatModal(false);

  // Fetch user details when the component mounts
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/user/user-details`); // API call to get user details
        const user = response.data.data; // Adjust the response structure as needed
        setUserDetails({ fullname: user.fullname, email: user.email }); // Set the user details in the state
        setLoading(false); // Turn off loading state
      } catch (error) {
        console.error("Error fetching user details:", error);
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  return (
    <div className="d-flex" style={{ height: "100vh" }}>
      <div
        style={{ width: "200px", backgroundColor: "#f0f0f0", padding: "2%" }}
      >
        {/* Sidebar */}
        <div style={{ padding: "10px" }}>
          <h3>Sidebar</h3>
          {/* Display loading indicator or user details */}
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div>
              <p>
                <strong>{userDetails.fullname}</strong>
              </p>
              <p>{userDetails.email}</p>
            </div>
          )}
          <ul style={{ listStyleType: "none", padding: 0 }}>
            <li>
              <Link to="/user/private-chats">Private Chats</Link>
            </li>
            <li>
              <Link to="/user/friends">Friend List</Link>
            </li>
            <li>
              <Link to="/user/groups">Group List</Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow-1 p-4">
        <div className="d-flex justify-content-end mb-3">
          <Button
            variant="primary"
            className="me-2"
            onClick={handleAddFriendClick}
          >
            Add Friend
          </Button>
          <Button variant="secondary" onClick={handleNewChatClick}>
            New Chat
          </Button>
        </div>

        <AddFriendModal
          show={showAddFriendModal}
          handleClose={handleCloseAddFriendModal}
        />
        <NewChatModal
          show={showNewChatModal}
          handleClose={handleCloseNewChatModal}
        />

        {/* Define Routes */}
        <Routes>
          <Route path="private-chats" element={<PrivateChatList />} />
          <Route path="friends" element={<FriendList />} />
          <Route path="groups" element={<GroupList />} />
        </Routes>
      </div>
    </div>
  );
};

export default UserPage;

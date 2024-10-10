// UserPage.js
import { useState, useEffect } from "react";
import axios from "../config/axiosConfig";

import Sidebar from "../components/Sidebar";
import ChatHeader from "../components/ChatHeader";
import UserRoutes from "../components/UserRoutes";
import AddFriendModal from "../modals/AddFriendModal";
import NewChatModal from "../modals/NewChatModal";
import useSignalR from "../hooks/useSignalR";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const HUB_BASE_URL = import.meta.env.VITE_HUB_BASE_URL;

const UserPage = () => {
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [userDetails, setUserDetails] = useState({ fullname: "", email: "" });
  const [loading, setLoading] = useState(true);

  const { hubConnection: chatHubConnection, connected: chatHubConnected } =
    useSignalR(`${HUB_BASE_URL}/chat`);
  const {
    hubConnection: notificationHubConnection,
    connected: notificationHubConnected,
  } = useSignalR(`${HUB_BASE_URL}/notification`);

  const handleAddFriendClick = () => setShowAddFriendModal(true);
  const handleNewChatClick = () => setShowNewChatModal(true);
  const handleCloseAddFriendModal = () => setShowAddFriendModal(false);
  const handleCloseNewChatModal = () => setShowNewChatModal(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/user/user-details`);
        const user = response.data.data;
        setUserDetails({ fullname: user.fullname, email: user.email });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user details:", error);
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  return (
    <div className="d-flex" style={{ height: "100vh" }}>
      <Sidebar userDetails={userDetails} loading={loading} />

      <div className="flex-grow-1 p-4">
        <ChatHeader
          handleAddFriendClick={handleAddFriendClick}
          handleNewChatClick={handleNewChatClick}
        />

        <AddFriendModal
          show={showAddFriendModal}
          handleClose={handleCloseAddFriendModal}
        />
        {chatHubConnection && (
          <NewChatModal
            show={showNewChatModal}
            handleClose={handleCloseNewChatModal}
            hubConnection={chatHubConnection}
          />
        )}

        <UserRoutes
          chatHubConnection={chatHubConnection}
          notificationHubConnection={notificationHubConnection}
        />
      </div>
    </div>
  );
};

export default UserPage;

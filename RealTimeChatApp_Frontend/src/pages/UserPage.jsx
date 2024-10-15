// UserPage.js
import { useState, useEffect } from "react";
import axios from "../config/axiosConfig";
import signalRService from "../services/signalRService";

import Sidebar from "../components/Sidebar";
import ChatHeader from "../components/ChatHeader";
import UserRoutes from "../components/UserRoutes";
import AddFriendModal from "../modals/AddFriendModal";
import NewGroupModel from "../modals/NewGroupModal";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const UserPage = () => {
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [userDetails, setUserDetails] = useState({ fullname: "", email: "" });
  const [loading, setLoading] = useState(true);

  const handleAddFriendClick = () => setShowAddFriendModal(true);
  const handleNewGroupClick = () => setShowNewGroupModal(true);
  const handleCloseAddFriendModal = () => setShowAddFriendModal(false);
  const handleCloseNewGroupModal = () => setShowNewGroupModal(false);

  useEffect(() => {
    const pageSetup = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/user/user-details`);
        if (response.status === 200) {
          const user = response.data.data;
          setUserDetails({ fullname: user.fullName, email: user.email });
          setLoading(false);
        }
        // initialize SignalR connections
        const jwtToken = localStorage.getItem("accessToken");
        signalRService.initializeConnections(jwtToken);
        await signalRService.startConnections();

        // Listen for error messages
        signalRService.onReceiveErrorMessage((errorMessage) => {
          console.error(`Error received: ${errorMessage}`);
        });
      } catch (error) {
        console.error("Error fetching user details:", error);
        setLoading(false);
      }
    };

    (async () => {
      await pageSetup();
    })();

    return () => {
      // cleanup function, for unmounting
      signalRService.stopConnections();
    };
  }, []);

  return (
    <div className="d-flex" style={{ height: "100vh" }}>
      <Sidebar userDetails={userDetails} loading={loading} />

      <div className="flex-grow-1 p-4">
        <ChatHeader
          handleAddFriendClick={handleAddFriendClick}
          handleNewGroupClick={handleNewGroupClick}
        />

        <AddFriendModal
          show={showAddFriendModal}
          handleClose={handleCloseAddFriendModal}
        />
        {signalRService && (
          <NewGroupModel
            show={showNewGroupModal}
            handleClose={handleCloseNewGroupModal}
          />
        )}

        <UserRoutes />
      </div>
    </div>
  );
};

export default UserPage;

import { useState, useEffect } from "react";
import axios from "axios";
import signalRService from "../services/signalRService";
import { Alert } from "react-bootstrap";

import Sidebar from "../components/dashboard/Sidebar";
import ChatHeader from "../components/dashboard/ChatHeader";
import UserRoutes from "../components/dashboard/UserRoutes";

import AddFriendModal from "../modals/AddFriendModal";
import NewGroupModal from "../modals/NewGroupModal";
import LogoutModal from "../modals/LogoutModal";
import { TokenService } from "../services/TokenService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const UserPage = () => {
  const [userDetails, setUserDetails] = useState({ fullname: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleAddFriendClick = () => setShowAddFriendModal(true);
  const handleNewGroupClick = () => setShowNewGroupModal(true);
  const handleLogoutClick = () => setShowLogoutModal(true);

  const handleCloseAddFriendModal = () => setShowAddFriendModal(false);
  const handleCloseNewGroupModal = () => setShowNewGroupModal(false);
  const handleCloseLogoutModal = () => setShowLogoutModal(false);

  const startSignalRConnections = async (jwtToken) => {
    let connected = false;
    const maxRetries = 5;

    while (retryCount < maxRetries && !connected) {
      try {
        signalRService.initializeConnections(jwtToken);
        await signalRService.startConnections();
        connected = true;
        setConnectionError(false);
      } catch (err) {
        console.error("SignalR connection failed:", err);
        setConnectionError(true);
        setRetryCount((prev) => prev + 1);

        const waitTime = Math.min(1000 * 2 ** retryCount, 20000); // max 20 sec wait time
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
    if (!connected) {
      console.error("Max retries reached. Could not connect to SignalR.");
    }
  };

  useEffect(() => {
    const pageSetup = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/user/user-details`);
        if (response.status === 200) {
          const user = response.data.data;
          setUserDetails({ fullname: user.fullName, email: user.email });
          setLoading(false);
        }
        // initialize SignalR connections
        const jwtToken = TokenService.getLocalAccessToken();
        await startSignalRConnections(jwtToken);
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setLoading(false);
      }
    };

    pageSetup();

    return () => {
      signalRService.stopConnections(); // cleanup function, for unmounting
    };
  }, []);

  return (
    <div className="d-flex" style={{ height: "100vh" }}>
      <Sidebar userDetails={userDetails} loading={loading} />

      <div className="flex-grow-1 p-4">
        <ChatHeader handleAddFriendClick={handleAddFriendClick} handleNewGroupClick={handleNewGroupClick} handleLogoutClick={handleLogoutClick} />

        <AddFriendModal show={showAddFriendModal} handleClose={handleCloseAddFriendModal} />
        <NewGroupModal show={showNewGroupModal} handleClose={handleCloseNewGroupModal} />
        <LogoutModal show={showLogoutModal} handleClose={handleCloseLogoutModal} />

        {connectionError && (
          <Alert variant="danger" onClose={() => setConnectionError(false)} dismissible>
            <Alert.Heading>Error!</Alert.Heading>
            <p>Unable to connect to the chat service. Retrying...</p>
          </Alert>
        )}
        <UserRoutes />
      </div>
    </div>
  );
};

export default UserPage;

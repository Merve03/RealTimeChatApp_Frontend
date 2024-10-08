import { Routes, Route, Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from "../config/axiosConfig"; // Assuming you have a config for axios
import * as signalR from "@microsoft/signalr";

import AddFriendModal from "../modals/AddFriendModal";
import NewChatModal from "../modals/NewChatModal";
import FriendList from "../components/FriendList";
import PrivateChatList from "../components/PrivateChatList";
import GroupList from "../components/GroupList";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const HUB_BASE_URL = import.meta.env.VITE_HUB_BASE_URL;

const UserPage = () => {
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  const [userDetails, setUserDetails] = useState({ fullname: "", email: "" }); // State to store user details
  const [loading, setLoading] = useState(true);

  const [chatHubConnection, setChatHubConnection] = useState(null);
  const [notificationHubConnection, setNotificationHubConnection] =
    useState(null);

  const handleAddFriendClick = () => setShowAddFriendModal(true);
  const handleNewChatClick = () => setShowNewChatModal(true);
  const handleCloseAddFriendModal = () => setShowAddFriendModal(false);
  const handleCloseNewChatModal = () => setShowNewChatModal(false);

  // establish signalR connection when component mounts
  useEffect(() => {
    const startHubConnections = async () => {
      try {
        const chatHubConnection = new signalR.HubConnectionBuilder()
          .withUrl(`${HUB_BASE_URL}/chat`)
          .withAutomaticReconnect()
          .configureLogging(signalR.LogLevel.Information)
          .build();

        await chatHubConnection.start();
        console.log("Connected to ChatHub");
        setChatHubConnection(chatHubConnection);

        chatHubConnection.on("ReceiveMessage", (message) => {
          console.log("Message received from ChatHub:", message);
        });

        const notificationHubConnection = new signalR.HubConnectionBuilder()
          .withUrl(`${HUB_BASE_URL}/notification`)
          .withAutomaticReconnect()
          .configureLogging(signalR.LogLevel.Information)
          .build();

        await notificationHubConnection.start();
        console.log("Connected to NotificationHub");
        setNotificationHubConnection(notificationHubConnection);

        notificationHubConnection.on("ReceiveNotification", (notification) => {
          console.log(
            "Notification received from NotificationHub:",
            notification
          );
        });
      } catch (error) {
        console.error("Error connecting to SignalR hub:", error);
      }
    };

    startHubConnections();

    return () => {
      // cleanup connections on component unmount
      if (chatHubConnection) {
        chatHubConnection.stop();
        console.log("Disconnected from ChatHub");
      }
      if (notificationHubConnection) {
        notificationHubConnection.stop();
        console.log("Disconnected from NotificationHub");
      }
    };
  }, []);

  // fetch user details when the component mounts
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
        {chatHubConnection && (
          <NewChatModal
            show={showNewChatModal}
            handleClose={handleCloseNewChatModal}
            hubConnection={chatHubConnection} // pass the connection as prop
          />
        )}

        {/* Define Routes */}
        <Routes>
          <Route
            path="private-chats"
            element={
              chatHubConnection ? (
                <PrivateChatList ChatHubConnection={chatHubConnection} />
              ) : (
                <div>Loading Chat Hub...</div>
              )
            }
          />
          <Route
            path="friends"
            element={
              notificationHubConnection ? (
                <FriendList
                  NotificationHubConnection={notificationHubConnection}
                />
              ) : (
                <div>Loading Notification Hub...</div>
              )
            }
          />
          <Route path="groups" element={<GroupList />} />
        </Routes>
      </div>
    </div>
  );
};

export default UserPage;

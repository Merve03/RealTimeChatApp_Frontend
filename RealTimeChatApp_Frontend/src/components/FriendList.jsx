import { useEffect, useState } from "react";
import { ListGroup, Spinner, Alert } from "react-bootstrap";
import axios from "../config/axiosConfig";
import PropTypes from "prop-types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const FriendList = ({ NotificationHubConnection }) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [onlineStatus, setOnlineStatus] = useState({});
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!NotificationHubConnection) {
      console.error("Notification hub connection is not provided.");
      return;
    }

    const connectionStateCheck = () => {
      if (NotificationHubConnection.connectionStarted) {
        console.log("NotificationHubConnection is connected");
        setConnected(true);
      } else {
        console.error("NotificationHubConnection not connected");
        setConnected(false);
      }
    };

    connectionStateCheck();

    // Attach event listeners only once when the component mounts
    NotificationHubConnection.onclose(connectionStateCheck);
    NotificationHubConnection.onreconnected(connectionStateCheck);

    // Clean up event listeners when the component unmounts or when connection is reset
    return () => {
      NotificationHubConnection.off("close", connectionStateCheck);
      NotificationHubConnection.off("reconnected", connectionStateCheck);
    };
  }, [NotificationHubConnection]);

  // Display the connection status
  console.log(
    "NotificationHubConnection state:",
    NotificationHubConnection.state
  );

  useEffect(() => {
    if (!connected) {
      return;
    }

    const fetchFriendsDetails = async () => {
      setLoading(true);
      setError(""); // Reset error state
      try {
        const response = await axios.get(
          `${API_BASE_URL}/user/friend-fullnames`
        );
        if (response.status === 200) {
          const friendData = response.data.data;

          // Convert the friend data to an array of { id, fullname } objects
          const friendsArray = Object.entries(friendData).map(
            ([id, fullname]) => ({
              id,
              fullname,
            })
          );

          setFriends(friendsArray);
        }
      } catch (error) {
        setError(
          "Error fetching friends: " +
            (error.response?.data?.message || error.message)
        );
      } finally {
        setLoading(false);
      }
    };

    // Handle online status
    NotificationHubConnection.on(
      "ReceiveFriendsOnlineStatus",
      (onlineStatus) => {
        console.log("Received online status from server:", onlineStatus);
        setOnlineStatus(onlineStatus);
      }
    );

    // Handle any error messages received via the NotificationHub
    NotificationHubConnection.on("ReceiveErrorMessage", (message) => {
      setError(message);
    });

    fetchFriendsDetails();

    return () => {
      NotificationHubConnection.off("ReceiveFriendsOnlineStatus");
      NotificationHubConnection.off("ReceiveErrorMessage");
    };
  }, [NotificationHubConnection, connected]);

  return (
    <div>
      <h3>Your Friends</h3>
      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}
      {!loading && !error && (
        <ListGroup>
          {friends.length === 0 ? (
            <Alert variant="info">No friends found.</Alert>
          ) : (
            friends.map((friend) => (
              <ListGroup.Item key={friend.id}>
                {friend.fullname}{" "}
                {onlineStatus[friend.id] !== undefined ? (
                  <span
                    style={{
                      color: onlineStatus[friend.id] ? "green" : "red",
                    }}
                  >
                    {onlineStatus[friend.id] ? "Online" : "Offline"}
                  </span>
                ) : (
                  <span>Loading status...</span>
                )}
              </ListGroup.Item>
            ))
          )}
        </ListGroup>
      )}
    </div>
  );
};

FriendList.propTypes = {
  NotificationHubConnection: PropTypes.object.isRequired,
};

export default FriendList;

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

  useEffect(() => {
    if (!NotificationHubConnection) {
      console.error("Notification hub connection is not provided.");
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
            ([id, fullname]) => ({ id, fullname })
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
    NotificationHubConnection.on(
      "ReceiveFriendsOnlineStatus",
      (onlineStatus) => {
        setOnlineStatus(onlineStatus);
      }
    );
    NotificationHubConnection.on("ReceiveErrorMessage", (message) => {
      setError(message);
    });

    fetchFriendsDetails();

    return () => {
      if (NotificationHubConnection) {
        NotificationHubConnection.off("ReceiveFriendsOnlineStatus");
        NotificationHubConnection.off("ReceiveErrorMessage");
      }
    };
  }, [NotificationHubConnection]);

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
  NotificationHubConnection: PropTypes.object,
};

export default FriendList;

import { useEffect, useState } from "react";
import { ListGroup, Spinner, Alert } from "react-bootstrap";
import axios from "../config/axiosConfig";
import signalRService from "../services/signalRService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const FriendList = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [onlineStatus, setOnlineStatus] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      setError("");
      try {
        const response = await axios.get(`${API_BASE_URL}/user/user-id`);
        if (response.status === 200) {
          setCurrentUserId(response.data.data);
        }
      } catch (error) {
        setError(
          "Error fetching authenticated user ID: " +
            (error.response?.data?.message || error.message)
        );
      }
    };
    fetchUserId();
  }, []);

  useEffect(() => {
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

    if (signalRService) {
      // Handle SignalR events for online status and errors
      signalRService.onReceiveFriendsOnlineStatus((status) => {
        setOnlineStatus((prevStatus) => ({ ...prevStatus, ...status }));
      });

      signalRService.onReceiveErrorMessage((message) => {
        console.error("Received error message: ", message);
        setError(message);
      });

      fetchFriendsDetails().then(() => {
        signalRService.getFriendsOnlineStatus();
      });
    }
    return () => {};
  }, []);

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
                {friend.id === currentUserId ? (
                  <span>(Me)</span> // Add "(Me)" for the current user's own entry
                ) : null}
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

export default FriendList;

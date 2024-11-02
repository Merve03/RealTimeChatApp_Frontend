import { useEffect, useState, useMemo } from "react";
import { ListGroup, Spinner, Alert, Image } from "react-bootstrap";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import signalRService from "../../services/signalRService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const FriendList = () => {
  const [friends, setFriends] = useState([]);
  const [onlineStatus, setOnlineStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { currentUserId, authError } = useAuth();

  useEffect(() => {
    const fetchFriendsData = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get(`${API_BASE_URL}/user/friend-details`);
        if (response.status === 200) {
          setFriends(response.data.data);

          const initialOnlineStatus = {};
          response.data.data.forEach((friend) => {
            initialOnlineStatus[friend.id] = friend.isOnline;
          });
          console.log("Initial online statuses: ", initialOnlineStatus);
          setOnlineStatus(initialOnlineStatus);
        }
      } catch (error) {
        setError("Error fetching data: " + error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFriendsData();
  }, []);

  useEffect(() => {
    const handleReceiveFriendsOnlineStatus = (status) => {
      const { userId, isOnline } = status;
      setOnlineStatus((prevStatus) => ({ ...prevStatus, [userId]: isOnline }));
      console.log("Online status has changed", onlineStatus);
    };

    const handleErrorMessage = (message) => {
      console.error("Received error message: ", message);
      setError(message);
    };

    if (signalRService.chatHubConn) {
      signalRService.onReceiveOnlineStatus(handleReceiveFriendsOnlineStatus);
      signalRService.onReceiveChatErrorMessage(handleErrorMessage);
    }

    return () => {
      if (signalRService.chatHubConn) {
        signalRService.offReceiveOnlineStatus(handleReceiveFriendsOnlineStatus);
        signalRService.offReceiveChatErrorMessage(handleErrorMessage);
      }
    };
  }, []);

  const friendStatus = useMemo(
    () =>
      friends.map((friend) => ({
        ...friend,
        isOnline: onlineStatus[friend.id],
      })),
    [friends, onlineStatus]
  );

  return (
    <div>
      <h3>Your Friends</h3>
      {loading && <Spinner animation="border" />}
      {authError && <Alert variant="danger">{authError}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      {!loading && !error && (
        <ListGroup>
          {friends.length === 0 ? (
            <Alert variant="info">No friends found.</Alert>
          ) : (
            friendStatus.map((friend) => (
              <ListGroup.Item key={friend.id} className="d-flex align-items-center">
                {friend.pictureUrl && <Image src={friend.pictureUrl} roundedCircle style={{ width: "40px", height: "40px", marginRight: "10px" }} />}
                <div className="d-flex flex-column">
                  <span>
                    {friend.fullname} {friend.id === currentUserId ? <span>(Me)</span> : null}
                  </span>
                  {friend.statusMessage && <span style={{ fontStyle: "italic", color: "#6c757d" }}>{friend.statusMessage}</span>}
                </div>
                {friend.isOnline !== undefined ? (
                  <span
                    style={{
                      marginLeft: "10px",
                      color: friend.isOnline ? "green" : "red",
                    }}
                  >
                    {friend.isOnline ? "Online" : "Offline"}
                  </span>
                ) : (
                  <span style={{ fontStyle: "italic", color: "#6c757d", marginLeft: "10px" }}>Loading status...</span>
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

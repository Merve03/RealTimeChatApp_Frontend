import { useEffect, useState } from "react";
import { ListGroup, Spinner, Alert } from "react-bootstrap";
import axios from "../config/axiosConfig";
import API_BASE_URL from "../config/config";

const FriendList = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch friends' details when the component mounts
  useEffect(() => {
    const fetchFriendsDetails = async () => {
      setLoading(true);
      setError(""); // Reset error state
      try {
        const response = await axios.get(
          `${API_BASE_URL}/user/friend-fullnames`
        );
        const friendData = response.data.data;

        // Convert the friend data to an array of { id, fullname } objects
        const friendsArray = Object.entries(friendData).map(
          ([id, fullname]) => ({ id, fullname })
        );

        setFriends(friendsArray);
      } catch (error) {
        setError(
          "Error fetching friends: " +
            (error.response?.data?.message || error.message)
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFriendsDetails();
  }, []);

  return (
    <div>
      <h3>Your Friends</h3>
      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}
      {!loading && !error && (
        <ListGroup>
          {friends.length === 0 ? (
            <ListGroup.Item>No friends found.</ListGroup.Item>
          ) : (
            friends.map((friend) => (
              <ListGroup.Item key={friend.id}>{friend.fullname}</ListGroup.Item>
            ))
          )}
        </ListGroup>
      )}
    </div>
  );
};

export default FriendList;

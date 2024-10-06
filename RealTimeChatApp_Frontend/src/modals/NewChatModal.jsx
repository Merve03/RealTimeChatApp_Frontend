import { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "../config/axiosConfig";
import API_BASE_URL from "../config/config";
import * as Yup from "yup";

const NewChatModal = ({ show, handleClose }) => {
  const [friendId, setFriendId] = useState("");
  const [chatTitle, setChatTitle] = useState("");
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [error, setError] = useState("");

  // Validation schema
  const validationSchema = Yup.object().shape({
    friendId: Yup.string().required("Please select a friend."),
    chatTitle: Yup.string().required("Please enter a chat title."),
  });

  // Fetch friends' details when the modal is opened
  useEffect(() => {
    if (show) {
      const fetchFriendsDetails = async () => {
        setLoadingFriends(true);
        try {
          const response = await axios.get(
            `${API_BASE_URL}/user/friend-fullnames`
          );
          const fullnames = response.data.data;
          const friendsArray = Object.entries(fullnames).map(
            ([id, fullname]) => ({ id, fullname })
          );
          setFriends(friendsArray);
        } catch (error) {
          alert(
            "Error fetching friends: " +
              (error.response?.data?.message || error.message)
          );
        } finally {
          setLoadingFriends(false);
        }
      };

      fetchFriendsDetails();
    }
  }, [show]);

  // Function to handle chat creation
  const handleCreateChat = async () => {
    setError(""); // Reset any previous error
    const isValid = validationSchema.isValidSync({ friendId, chatTitle }); // Validate both fields

    if (!isValid) {
      setError("Please select a friend and enter a chat title.");
      return;
    }

    setLoadingFriends(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/user/new-private-chat`,
        {
          ChatTitle: chatTitle, // Include chat title in the request
          FriendId: friendId,
        }
      );
      alert(response.data.message);
      handleClose();
    } catch (error) {
      alert(
        "Error creating chat: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoadingFriends(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Create New Chat</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formChatTitle">
            <Form.Label>Chat Title</Form.Label>
            <Form.Control
              type="text"
              value={chatTitle}
              onChange={(e) => setChatTitle(e.target.value)}
              isInvalid={!!error && !chatTitle} // Validate input
            />
            <Form.Control.Feedback type="invalid">
              {error}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="formFriendId">
            <Form.Label>Select Friend</Form.Label>
            <Form.Control
              as="select"
              value={friendId}
              onChange={(e) => setFriendId(e.target.value)}
              isInvalid={!!error && !friendId} // Validate input
              disabled={loadingFriends}
            >
              <option value="">Select a friend</option>
              {friends.map((friend) => (
                <option key={friend.id} value={friend.id}>
                  {friend.fullname}
                </option>
              ))}
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              {error}
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={handleClose}
          disabled={loadingFriends}
        >
          Close
        </Button>
        <Button
          variant="primary"
          onClick={handleCreateChat}
          disabled={loadingFriends}
        >
          {loadingFriends ? "Creating..." : "Create Chat"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NewChatModal;

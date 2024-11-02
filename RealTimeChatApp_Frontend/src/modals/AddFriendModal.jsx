import { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner, ListGroup, Image } from "react-bootstrap";
import PropTypes from "prop-types";
import addFriendIcon from "../assets/user-plus.svg";

import axios from "axios";
import signalRService from "../services/signalRService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AddFriendModal = ({ show, handleClose }) => {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchText.trim().length > 3) {
        setLoading(true);
        setError("");
        signalRService.searchFriend(searchText);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchText]);

  useEffect(() => {
    const handleReceiveSearchResults = (results) => {
      setSearchResults(results);
      setLoading(false);
    };

    if (show && signalRService.searchHubConn) {
      signalRService.OnReceiveSearchResults(handleReceiveSearchResults);
    }

    return () => {
      signalRService.OffReceiveSearchResults(handleReceiveSearchResults);
    };
  }, [show]);

  const handleAddFriend = async (friendId) => {
    if (!friendId) {
      setError("Please select a user to add.");
      return;
    }
    setError("");
    setSuccessMessage(""); // Reset previous success message

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/user/add-friend`, {
        friendId,
      });
      setSuccessMessage(response.data.message || "Friend added and chat created!");
      setSearchText("");
      setSearchResults([]);
    } catch (err) {
      const errorResponse = err.response?.data;
      let errorMessage = "Error adding friend: ";
      if (errorResponse) {
        if (errorResponse.type === "NotFound") {
          errorMessage += "User not found.";
        } else if (errorResponse.type === "Conflict") {
          errorMessage += "Friend request already sent or user is already your friend.";
        } else if (errorResponse.type === "Unauthorized") {
          errorMessage += "You must be logged in to add friends.";
        } else if (errorResponse.type === "ServerError") {
          errorMessage += "An unexpected server error occurred.";
        } else {
          errorMessage += errorResponse.message || "An unknown error occurred.";
        }
      } else {
        errorMessage += err.message; // Fallback to generic error message
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add Friend</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formSearch">
            <Form.Label>Search for a friend</Form.Label>
            <Form.Control type="text" placeholder="Enter friend's name" value={searchText} onChange={(e) => setSearchText(e.target.value)} isInvalid={!!error} />
            <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
          </Form.Group>
          {loading && <Spinner animation="border" size="sm" className="my-2" />}
          <ListGroup>
            {searchResults.map((user) => (
              <ListGroup.Item key={user.userId}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  {user.userPictureUrl && <Image src={user.userPictureUrl} roundedCircle style={{ width: "40px", height: "40px", marginRight: "10px" }} />}
                  <span> {user.fullname}</span>
                  <img
                    src={addFriendIcon}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddFriend(user.userId);
                    }}
                    style={{ cursor: "pointer", marginLeft: "auto", width: "20px", height: "20px" }}
                  />
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Form>
        {successMessage && <p className="text-success mt-2">{successMessage}</p>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

AddFriendModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default AddFriendModal;

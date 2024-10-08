import { useEffect, useState } from "react";
import axios from "axios";
import {
  ListGroup,
  ListGroupItem,
  Container,
  Row,
  Col,
  Spinner,
  Alert,
} from "react-bootstrap";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const UserPrivateChats = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch user private chats
    const fetchChats = async () => {
      try {
        // Corrected URL structure
        const response = await axios.get(
          `${API_BASE_URL}/user/user-private-chats`
        );
        if (response.status === 200) {
          setChats(response.data.data);
        }
      } catch (err) {
        setError(err.response?.data.message || "Failed to fetch chats");
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <h2>Your Private Chats</h2>
      {chats.length === 0 ? (
        <Alert variant="info">No private chats available</Alert>
      ) : (
        <ListGroup>
          {chats.map((chat) => (
            <ListGroupItem key={chat._id}>
              <Row>
                <Col>
                  <strong>Chat Title:</strong> {chat.chatTitle}
                </Col>
                <Col>
                  <strong>Type:</strong> {chat.type === 0 ? "Private" : "Group"}
                </Col>
                <Col>
                  <strong>Messages:</strong> {chat.messageIds.length}
                </Col>
              </Row>
            </ListGroupItem>
          ))}
        </ListGroup>
      )}
    </Container>
  );
};

export default UserPrivateChats;

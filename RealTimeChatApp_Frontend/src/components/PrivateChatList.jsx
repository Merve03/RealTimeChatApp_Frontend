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

const UserPrivateChats = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const limit = 20;

  useEffect(() => {
    // Fetch user private chats
    const fetchChats = async () => {
      try {
        // Corrected URL structure
        const response = await axios.get(`/user/user-private-chats/${limit}`);
        setChats(response.data.data); // Assuming data contains the list of ChatModels
      } catch (err) {
        setError(err.response?.data.message || "Failed to fetch chats");
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [limit]);

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

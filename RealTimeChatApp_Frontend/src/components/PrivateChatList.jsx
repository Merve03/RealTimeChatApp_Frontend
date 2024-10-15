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
  Button,
} from "react-bootstrap";

import PrivateChat from "./PrivateChat";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PrivateChatList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chats, setChats] = useState([]); // Store chat details
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
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

      {!selectedChat ? (
        chats.length === 0 ? (
          <Alert variant="info">No private chats available</Alert>
        ) : (
          <ListGroup>
            {chats.map((chat) => (
              <ListGroupItem
                key={chat.chatId} // Use chatId as the key
                onClick={() => setSelectedChat(chat)}
              >
                <Row>
                  <Col>
                    <strong>Recipient:</strong> {chat.recipientFullname}
                  </Col>
                  <Col>
                    <strong>Last Message:</strong> {chat.lastMessage}
                  </Col>
                </Row>
              </ListGroupItem>
            ))}
          </ListGroup>
        )
      ) : (
        <>
          <Button
            variant="secondary"
            className="mt-3"
            onClick={() => setSelectedChat(null)} // Deselect chat
          >
            Back to Chat List
          </Button>
          <PrivateChat chat={selectedChat} />
        </>
      )}
    </Container>
  );
};

export default PrivateChatList;

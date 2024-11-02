import { useEffect, useState } from "react";
import axios from "axios";
import { ListGroup, ListGroupItem, Container, Row, Col, Spinner, Alert, Button, Image } from "react-bootstrap";

import PrivateChat from "./PrivateChat";
import signalRService from "../../services/signalRService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PrivateChatList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/user/user-private-chats`);
        if (response.status === 200) {
          setChats(response.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch chats");
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  const handleJoinChat = async (chatId) => {
    try {
      await signalRService.joinChatRoom(chatId);
    } catch (err) {
      setError(`Failed to join chat: ${err.message}`);
    }
  };

  const handleLeaveChat = async (chatId) => {
    try {
      await signalRService.leaveChatRoom(chatId);
    } catch (err) {
      setError(`Failed to leave chat: ${err.message}`);
    }
  };

  return (
    <Container>
      {loading && (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" />
        </div>
      )}
      {error && <Alert variant="danger">{error}</Alert>}
      {!error && !loading && (
        <>
          <h2>Your Private Chats</h2>
          {!selectedChat ? (
            chats.length === 0 ? (
              <Alert variant="info">No private chats available</Alert>
            ) : (
              <ListGroup>
                {chats.map((chat) => (
                  <ListGroupItem
                    key={chat.chatId}
                    onClick={() => {
                      setSelectedChat(chat);
                      handleJoinChat(chat.chatId);
                    }}
                  >
                    <Row>
                      <Col>
                        {chat.recipientPictureUrl && <Image src={chat.recipientPictureUrl} roundedCircle style={{ width: "40px", height: "40px", marginRight: "10px" }} />}
                        {chat.recipientFullname}
                      </Col>
                      <Col>
                        <strong>{chat.lastMessageSender}:</strong> {chat.lastMessage}
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
                onClick={() => {
                  handleLeaveChat(selectedChat.chatId);
                  setSelectedChat(null);
                }}
              >
                Back to Chat List
              </Button>
              <PrivateChat chat={selectedChat} />
            </>
          )}
        </>
      )}
    </Container>
  );
};

export default PrivateChatList;

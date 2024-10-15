import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import {
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  Form,
  Button,
} from "react-bootstrap";

import signalRService from "../services/signalRService";

const PrivateChat = ({ chat }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { chatId, recipientFullname } = chat;

  useEffect(() => {
    const initializeChat = async () => {
      try {
        await signalRService.fetchPreviousMessages(chatId);
      } catch (err) {
        console.error("Error while fetching previous messages:", err);
        setError("Failed to load chat history.");
        setLoading(false);
      }
    };
    if (signalRService) {
      signalRService.onReceivePreviousMessages((fetchedMessages) => {
        setMessages(fetchedMessages);
        setLoading(false);
      });

      signalRService.onReceiveMessage((messageDetails) => {
        setMessages((prevMessages) => [...prevMessages, messageDetails]);
      });

      signalRService.onReceiveErrorMessage((errorMessage) => {
        setError(errorMessage);
      });
      initializeChat();
    } else {
      console.log("SignalR service is not available.");
    }

    return () => {};
  }, [chatId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return; // prevent empty message sub

    try {
      await signalRService.sendMessage(chatId, newMessage);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          senderFullname: "You",
          content: newMessage,
          sentAt: new Date(),
          readStatus: false,
        },
      ]);
      setNewMessage(""); // clear the input after sending
    } catch (err) {
      console.error("Error while sending message:", err);
      setError("Failed to send the message.");
    }
  };

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
      <Row className="mb-3">
        <Col>
          <h4>Chat with: {recipientFullname}</h4>
        </Col>
      </Row>
      <div className="chat-messages mb-3">
        {messages.length === 0 ? (
          <Alert variant="info">No messages yet</Alert>
        ) : (
          messages.map((msg) => (
            <Row key={msg.chatId} className="my-2">
              <Col>
                <strong>{msg.senderFullname}: </strong>
                {msg.content}
                <div>
                  <small className="text-muted">
                    Sent At:{moment(msg.sentAt).format("YYYY/MM/DD HH:mm:ss")}
                  </small>
                </div>
                <div>
                  <small className="text-muted">
                    Status: {msg.readStatus ? "Read" : "Unread"}
                  </small>
                </div>
              </Col>
            </Row>
          ))
        )}
      </div>
      <Form onSubmit={handleSendMessage}>
        <Form.Group controlId="newMessage">
          <Form.Label>Send a message</Form.Label>
          <Form.Control
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            maxLength={1000}
          />
        </Form.Group>
        <Button type="submit" variant="primary" className="mt-2">
          Send
        </Button>
      </Form>
    </Container>
  );
};

PrivateChat.propTypes = {
  chat: PropTypes.shape({
    chatId: PropTypes.string.isRequired,
    recipientFullname: PropTypes.string,
  }).isRequired,
};

export default PrivateChat;

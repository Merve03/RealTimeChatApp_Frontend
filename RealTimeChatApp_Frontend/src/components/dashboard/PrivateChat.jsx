import { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { Container, Row, Col, Spinner, Alert, Form, Button } from "react-bootstrap";
import useAuth from "../../hooks/useAuth";
import signalRService from "../../services/signalRService";

const PrivateChat = ({ chat }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);
  const { currentUserId, authError } = useAuth();

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
    const handleReceivePreviousMessages = (fetchedMessages) => {
      setMessages(fetchedMessages);
      setLoading(false);
    };

    const handleReceiveMessage = (messageDetails) => {
      setMessages((prevMessages) => [...prevMessages, messageDetails]);
    };

    const handleReceiveErrorMessage = (errorMessage) => {
      setError(errorMessage);
    };

    const handleReceiveTypingNotification = (typingUserId) => {
      console.log(`Received typing notification from: ${typingUserId}`);
      if (typingUserId !== currentUserId) {
        setTypingUser(typingUserId);
        setIsTyping(true);
        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      }
    };

    if (signalRService.chatHubConn) {
      signalRService.onReceivePreviousMessages(handleReceivePreviousMessages);
      signalRService.onReceiveMessage(handleReceiveMessage);
      signalRService.onReceiveTypingNotification(handleReceiveTypingNotification);
      signalRService.onReceiveChatErrorMessage(handleReceiveErrorMessage);
      initializeChat();
    } else {
      console.log("SignalR service is not available.");
    }

    return () => {
      signalRService.offReceivePreviousMessages(handleReceivePreviousMessages);
      signalRService.offReceiveMessage(handleReceiveMessage);
      signalRService.offReceiveTypingNotification(handleReceiveTypingNotification);
      signalRService.offReceiveChatErrorMessage(handleReceiveErrorMessage);
      clearTimeout(typingTimeout.current);
    };
  }, [chatId, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await signalRService.sendMessage(chatId, newMessage);
      setNewMessage("");
    } catch (err) {
      console.error("Error while sending message:", err);
      setError("Failed to send the message.");
    }
  };

  const handleTyping = () => {
    signalRService.sendTypingNotification(chatId);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      setIsTyping(false); // clean the notification
      setTypingUser(null);
    }, 3000);
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
          <strong>Chat with: {recipientFullname}</strong>
        </Col>
      </Row>
      {authError && <Alert variant="danger">{authError}</Alert>}
      <div className="chat-messages mb-3">
        {messages.length === 0 ? (
          <Alert variant="info">No messages yet</Alert>
        ) : (
          messages.map((msg) => (
            <Row key={msg.chatId} className="my-2" style={{ display: "flex" }}>
              <Col className={`chat-message ${msg.senderId === currentUserId ? "user-message" : "recipient-message"}`}>
                <strong>{msg.senderFullname}: </strong>
                {msg.content}
                <div>
                  <small className="text-muted">Sent At: {moment(msg.sentAt).format("YYYY/MM/DD HH:mm:ss")}</small>
                </div>
                <div>
                  <small className="text-muted">Status: {msg.readStatus ? "Read" : "Unread"}</small>
                </div>
              </Col>
            </Row>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <Form onSubmit={handleSendMessage}>
        <Form.Group controlId="newMessage">
          {isTyping ? (
            <Row>
              <Col>
                <small className="text-muted">{recipientFullname} is typing...</small>
              </Col>
            </Row>
          ) : (
            <Form.Label>Send a message</Form.Label>
          )}

          <Form.Control
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
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

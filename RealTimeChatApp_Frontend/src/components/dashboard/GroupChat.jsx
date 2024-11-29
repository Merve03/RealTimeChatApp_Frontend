import { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { Container, Row, Col, Spinner, Alert, Form, Button } from "react-bootstrap";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import signalRService from "../../services/signalRService";

import MembersSidebar from "../../modals/MembersSidebar";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const GroupChat = ({ group }) => {
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);
  const { currentUserId, authError } = useAuth();

  const { groupName, description, groupChatId } = group;

  useEffect(() => {
    const initializeGroup = async () => {
      try {
        const membersResponse = await axios.get(`${API_BASE_URL}/group/members/${groupChatId}`);
        if (membersResponse.status === 200) {
          console.log("Fetched members:", membersResponse.data);
          setMembers(membersResponse.data.data);
        } else {
          setError("Unexpected response status: " + membersResponse.status);
        }
      } catch (err) {
        console.error("Error fetching members:", err);

        if (err.response) {
          console.error("Error response data:", err.response.data);
          if (err.response.status >= 400 && err.response.status < 500) {
            setError("Client error: " + (err.response.data?.message || "An issue occurred with your request."));
          } else if (err.response.status >= 500) {
            setError("Server error: Please try again later.");
          }
        } else if (err.request) {
          setError("Network error: Unable to connect to the server. Please check your internet connection.");
        } else {
          setError("An error occurred: " + err.message);
        }
      }
    };

    initializeGroup();
  }, [groupChatId]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const initializeChat = async () => {
      try {
        signalRService.fetchPreviousGroupMessages(groupChatId);
      } catch (err) {
        console.error("Error while fetching previous group messages:", err);
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
        const typer = members.find((member) => member.memberId === typingUserId);
        if (typer !== null) {
          setTypingUser(typer.fullname);
          setIsTyping(true);
          clearTimeout(typingTimeout.current);
          typingTimeout.current = setTimeout(() => {
            setIsTyping(false);
          }, 3000);
        }
      }
    };

    if (signalRService.groupHubConn) {
      signalRService.onReceivePreviousGroupMessages(handleReceivePreviousMessages);
      signalRService.onReceiveGroupMessage(handleReceiveMessage);
      signalRService.onReceiveGroupTypingNotification(handleReceiveTypingNotification);
      signalRService.onReceiveGroupErrorMessage(handleReceiveErrorMessage);

      initializeChat();
    } else {
      console.log("SignalR service is not available.");
    }

    return () => {
      signalRService.offReceivePreviousGroupMessages(handleReceivePreviousMessages);
      signalRService.offReceiveGroupMessage(handleReceiveMessage);
      signalRService.offReceiveGroupTypingNotification(handleReceiveTypingNotification);
      signalRService.offReceiveGroupErrorMessage(handleReceiveErrorMessage);
      clearTimeout(typingTimeout.current);
    };
  }, [currentUserId, groupChatId, members]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await signalRService.sendGroupMessage(groupChatId, newMessage);
      setNewMessage("");
    } catch (err) {
      console.error("Error while sending message to group:", err);
      setError("Failed to send the message.");
    }
  };

  const handleTyping = () => {
    signalRService.sendGroupTypingNotification(groupChatId);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      setIsTyping(false);
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
          <strong>{groupName}</strong>
        </Col>
        <Button variant="primary" className="mt-3 mb-3" onClick={toggleSidebar}>
          Show Members
        </Button>
        <Col>
          <h4>{description}</h4>
        </Col>
      </Row>
      {authError && <Alert variant="danger">{authError}</Alert>}
      <div className="chat-messages mb-3">
        {messages.length === 0 ? (
          <Alert variant="info">No messages yet</Alert>
        ) : (
          messages.map((msg) => (
            <Row key={msg.id} className="my-2 msg-row" style={{ display: "flex" }}>
              <Col className={`chat-message ${msg.senderId === currentUserId ? "user-message" : "recipient-message"}`}>
                <strong>{msg.senderFullname}: </strong>
                {msg.content}
                <div>
                  <small className="text-muted">Sent At: {moment(msg.sentAt).format("YYYY/MM/DD HH:mm:ss")}</small>
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
                <small className="text-muted">{typingUser} is typing...</small>
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

      <MembersSidebar isOpen={isSidebarOpen} onClose={toggleSidebar} members={members} />
    </Container>
  );
};

GroupChat.propTypes = {
  group: PropTypes.shape({
    groupId: PropTypes.string.isRequired,
    groupName: PropTypes.string.isRequired,
    description: PropTypes.string,
    groupChatId: PropTypes.string.isRequired,
  }).isRequired,
};

export default GroupChat;

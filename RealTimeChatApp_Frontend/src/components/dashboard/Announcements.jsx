import { useEffect, useState, useRef } from "react";
import moment from "moment";
import { Container, Row, Col, Spinner, Alert, Form, Button } from "react-bootstrap";
import useAuth from "../../hooks/useAuth";
import signalRService from "../../services/signalRService";

import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const { currentUserId, authError } = useAuth();

  useEffect(() => {
    const initialize = async () => {
      try {
        await signalRService.fetchPreviousBroadcasts();
        const roleCheck = await axios.get(`${API_BASE_URL}/user/superadmin-check`);
        if (roleCheck.data.data === true) {
          setIsAdmin(true);
        }
      } catch (err) {
        console.error("Error while fetching previous announcements:", err);
        setError("Failed to load announcement history.");
        setLoading(false);
      }
    };
    const handleReceivePreviousBroadcasts = (fetchedMessages) => {
      console.log("Fetched previous broadcasts: " + fetchedMessages);
      setAnnouncements(fetchedMessages);
      setLoading(false);
    };

    const handleReceiveBroadcast = (messageDetails) => {
      setAnnouncements((prevMessages) => [...prevMessages, messageDetails]);
    };

    const handleReceiveErrorMessage = (errorMessage) => {
      setError(errorMessage);
    };

    if (signalRService.chatHubConn) {
      signalRService.onReceivePreviousBroadcasts(handleReceivePreviousBroadcasts);
      signalRService.onReceiveBroadcast(handleReceiveBroadcast);
      signalRService.onReceiveChatErrorMessage(handleReceiveErrorMessage);
      initialize();
    } else {
      console.log("SignalR service is not available.");
    }

    return () => {
      signalRService.offReceivePreviousBroadcasts(handleReceivePreviousBroadcasts);
      signalRService.offReceiveBroadcast(handleReceiveBroadcast);
      signalRService.offReceiveChatErrorMessage(handleReceiveErrorMessage);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [announcements]);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.trim()) return;

    try {
      await signalRService.broadcastMessage(newAnnouncement);
      setNewAnnouncement("");
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
      {authError && <Alert variant="danger">{authError}</Alert>}
      <div className="chat-messages mb-3">
        {announcements.length === 0 ? (
          <Alert variant="info">No announcement yet</Alert>
        ) : (
          announcements.map((ann) => (
            <Row key={ann.id} className="my-2" style={{ display: "flex" }}>
              <Col className={`chat-message ${ann.senderId === currentUserId ? "user-message" : "recipient-message"}`}>
                <strong>{ann.senderFullname}: </strong>
                {ann.content}
                <div>
                  <small className="text-muted">Sent At: {moment(ann.sentAt).format("YYYY/MM/DD HH:mm:ss")}</small>
                </div>
                <div>
                  <small className="text-muted">Status: {ann.readStatus ? "Read" : "Unread"}</small>
                </div>
              </Col>
            </Row>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      {isAdmin && (
        <Form onSubmit={handleBroadcast}>
          <Form.Group controlId="newMessage">
            <Form.Label>Send a message</Form.Label>
            <Form.Control type="text" placeholder="Type your message..." value={newAnnouncement} onChange={(e) => setNewAnnouncement(e.target.value)} maxLength={1000} />
          </Form.Group>
          <Button type="submit" variant="primary" className="mt-2">
            Send
          </Button>
        </Form>
      )}
    </Container>
  );
};

export default Announcements;

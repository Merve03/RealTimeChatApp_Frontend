import axios from "axios";
import { ListGroup, ListGroupItem, Container, Row, Col, Spinner, Alert, Button } from "react-bootstrap";
import signalRService from "../../services/signalRService";
import GroupChat from "./GroupChat";
import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const GroupList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/group/all-groups`);
        if (response.status === 200) {
          setGroups(response.data.data);
        }
      } catch (err) {
        setError(err.response?.data.message || "Failed to fetch chats");
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const handleJoinChat = async (chatId) => {
    try {
      await signalRService.joinGroupChatRoom(chatId);
    } catch (err) {
      setError(`Failed to join chat: ${err.message}`);
    }
  };

  const handleLeaveChat = async (chatId) => {
    try {
      await signalRService.leaveGroupChatRoom(chatId);
    } catch (err) {
      setError(`Failed to leave chat: ${err.message}`);
    }
  };

  return (
    <Container>
      {loading ? (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : !selectedGroup ? (
        <>
          <h2>Joined Groups</h2>
          {groups.length === 0 ? (
            <Alert variant="info">No available groups.</Alert>
          ) : (
            <ListGroup>
              {groups.map((group) => (
                <ListGroupItem
                  key={group.groupChatId}
                  onClick={() => {
                    setSelectedGroup(group);
                    handleJoinChat(group.groupChatId);
                  }}
                >
                  <Row>
                    <Col>
                      <strong>{group.groupName}</strong>
                    </Col>
                    <Col>
                      <strong>{group.lastMessageSender}:</strong> {group.lastMessageContent}
                    </Col>
                  </Row>
                </ListGroupItem>
              ))}
            </ListGroup>
          )}
        </>
      ) : (
        <>
          <Button
            variant="secondary"
            className="mt-3"
            onClick={() => {
              handleLeaveChat(selectedGroup.groupChatId);
              setSelectedGroup(null);
            }}
          >
            Back to Group List
          </Button>
          <GroupChat group={selectedGroup} />
        </>
      )}
    </Container>
  );
};

export default GroupList;

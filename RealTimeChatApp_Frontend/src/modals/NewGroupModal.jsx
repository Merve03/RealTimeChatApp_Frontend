import { useEffect, useState } from "react";
import { Modal, Button, Form, Dropdown, Image } from "react-bootstrap";
import axios from "axios";
import * as Yup from "yup";
import PropTypes from "prop-types";

import signalRService from "../services/signalRService";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const NewGroupModal = ({ show, handleClose }) => {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [memberIds, setMemberIds] = useState([]);
  const [friends, setFriends] = useState([]);

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchFriendsData = async () => {
      setLoading(true);
      setApiError(""); // Reset API error state
      try {
        const response = await axios.get(`${API_BASE_URL}/user/friend-details`);
        if (response.status === 200) {
          setFriends(response.data.data);
        }
      } catch (error) {
        setApiError("Error fetching data: " + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };
    if (show) {
      fetchFriendsData();
    }
  }, [show]);

  const validationSchema = Yup.object().shape({
    groupName: Yup.string().required("Group name is required").max(50, "Group name cannot exceed 50 characters."),
    description: Yup.string().max(100, "Group description cannot exceed 100 characters."),
    memberIds: Yup.array().min(1, "At least 1 other member is required."),
  });

  const handleCreateGroup = async () => {
    setApiError("");
    setSuccessMessage("");
    setValidationErrors({}); // Reset validation errors

    try {
      await validationSchema.validate({ groupName, description, memberIds }, { abortEarly: false });

      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/group/new-group`, {
        groupName,
        description,
        memberIds,
      });
      if (response.status === 200 || response.status === 201) {
        setSuccessMessage(response.data.message || "Group created successfully!");
        setGroupName("");
        setDescription("");
        setMemberIds([]);

        const chatId = response.data.data;
        if (chatId) {
          await signalRService.joinGroupChatRoom(chatId); // connect to this new group right away
        }
      } else {
        console.log(response);
      }
    } catch (err) {
      if (err.name === "ValidationError") {
        const errors = {};
        err.inner.forEach((error) => {
          errors[error.path] = error.message;
        });
        setValidationErrors(errors);
      } else {
        const errorMessage = err.response?.data?.message || err.message;
        setApiError(`Error creating group: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMember = (id) => {
    setMemberIds((prevIds) => {
      if (prevIds.includes(id)) {
        return prevIds.filter((memberId) => memberId !== id);
      } else {
        return [...prevIds, id];
      }
    });
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Create a new group</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formGroupName">
            <Form.Label>Group Name</Form.Label>
            <Form.Control type="text" placeholder="Enter group name" value={groupName} onChange={(e) => setGroupName(e.target.value)} isInvalid={!!validationErrors.groupName} />
            <Form.Control.Feedback type="invalid">{validationErrors.groupName}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="formDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control type="text" placeholder="Enter group description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} isInvalid={!!validationErrors.description} />
            <Form.Control.Feedback type="invalid">{validationErrors.description}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="formMembers">
            <Form.Label>Select members</Form.Label>
            <Dropdown>
              <Dropdown.Toggle variant="success" id="dropdown-basic">
                {memberIds.length === 0 ? "Select Friends" : `${memberIds.length} Selected`}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {friends.map((friend) => (
                  <Dropdown.Item key={friend.id} onClick={() => handleSelectMember(friend.id)} active={memberIds.includes(friend.id)}>
                    {friend.friendPictureUrl && <Image src={friend.friendPictureUrl} roundedCircle style={{ width: "40px", height: "40px", marginRight: "10px" }} />}
                    {friend.fullname}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
            {validationErrors.memberIds && <p className="text-danger">{validationErrors.memberIds}</p>}
          </Form.Group>
        </Form>
        {successMessage && <p className="text-success">{successMessage}</p>}
        {apiError && <p className="text-danger">{apiError}</p>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Close
        </Button>
        <Button variant="primary" onClick={handleCreateGroup} disabled={loading}>
          {loading ? "Creating..." : "Create Group"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

NewGroupModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default NewGroupModal;

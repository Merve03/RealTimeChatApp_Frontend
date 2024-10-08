import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "../config/axiosConfig";
import * as Yup from "yup";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AddFriendModal = ({ show, handleClose }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
  });

  const handleAddFriend = async () => {
    setError(""); // Reset any previous error
    const validation = validationSchema.validateSync(
      { email },
      { abortEarly: false }
    );

    if (validation.error) {
      setError(validation.error.message);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/user/add-friend`, {
        email,
      });
      alert(response.data.message);
      handleClose();
    } catch (error) {
      alert(
        "Error adding friend: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add Friend</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter friend's email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isInvalid={!!error}
            />
            <Form.Control.Feedback type="invalid">
              {error}
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Close
        </Button>
        <Button variant="primary" onClick={handleAddFriend} disabled={loading}>
          {loading ? "Adding..." : "Add Friend"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddFriendModal;

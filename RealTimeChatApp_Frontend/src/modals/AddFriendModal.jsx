import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "../config/axiosConfig";
import * as Yup from "yup";
import PropTypes from "prop-types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AddFriendModal = ({ show, handleClose }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
  });

  const handleAddFriend = async () => {
    setError("");
    setSuccessMessage(""); // Reset previous success message

    try {
      await validationSchema.validate({ email }, { abortEarly: false });

      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/user/add-friend`, {
        email,
      });
      setSuccessMessage(
        response.data.message || "Friend added and chat created!"
      );
      setEmail("");
    } catch (err) {
      if (err.name === "ValidationError") {
        setError(err.errors[0]);
      } else {
        const errorMessage = err.response?.data?.message || err.message;
        setError(`Error adding friend: ${errorMessage}`);
      }
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
        {successMessage && <p className="text-success">{successMessage}</p>}
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
AddFriendModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};
export default AddFriendModal;

import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import PropTypes from "prop-types";
import { Modal, Button, Spinner } from "react-bootstrap";
import signalRService from "../services/signalRService";
import { useAuthContext } from "../utils/AuthProvider";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const LogoutModal = ({ show, handleClose }) => {
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { logout } = useAuthContext(); // get the logout function

  const handleLogout = async () => {
    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const response = await axios.post(`${API_BASE_URL}/account/logout`);
      if (response.status === 200) {
        await signalRService.stopConnections(); // disconnect from hubs
        logout();
        
        setSuccessMessage(response.data.message || "Successfully logged out.");
        navigate("/login");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Log out</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Log out from the app?</p>
        {successMessage && <p className="text-success">{successMessage}</p>}
        {error && <p className="text-danger">{error}</p>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleLogout} disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : "Yes"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
LogoutModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};
export default LogoutModal;

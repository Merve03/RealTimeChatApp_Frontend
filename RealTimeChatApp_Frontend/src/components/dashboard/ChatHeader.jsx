import { Button } from "react-bootstrap";

const ChatHeader = ({ handleAddFriendClick, handleNewGroupClick, handleLogoutClick }) => (
  <div className="d-flex justify-content-end mb-3">
    <Button variant="primary" className="me-2" onClick={handleAddFriendClick}>
      Add Friend
    </Button>
    <Button variant="secondary" className="me-2" onClick={handleNewGroupClick}>
      New Group
    </Button>
    <Button variant="secondary" className="btn-danger me-2" onClick={handleLogoutClick}>
      Logout
    </Button>
  </div>
);

export default ChatHeader;

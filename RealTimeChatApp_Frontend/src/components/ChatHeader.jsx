import { Button } from "react-bootstrap";

const ChatHeader = ({ handleAddFriendClick, handleNewGroupClick }) => (
  <div className="d-flex justify-content-end mb-3">
    <Button variant="primary" className="me-2" onClick={handleAddFriendClick}>
      Add Friend
    </Button>
    <Button variant="secondary" onClick={handleNewGroupClick}>
      New Group
    </Button>
  </div>
);

export default ChatHeader;

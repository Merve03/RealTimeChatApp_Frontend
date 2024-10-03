import { useState } from "react";
import {
  Form,
  Row,
  Col,
  FormGroup,
  FormControl,
  Button,
} from "react-bootstrap";

const WaitingRoom = ({ joinChatRoom }) => {
  const [email, setEmail] = useState();
  const [chatroom, setChatroom] = useState();

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        joinChatRoom(email, chatroom);
      }}
    >
      <Row className="px-5 py-5">
        <Col sm={12}>
          <FormGroup>
            <FormControl
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            ></FormControl>
            <FormControl
              placeholder="Group Id"
              onChange={(e) => setChatroom(e.target.value)}
            ></FormControl>
          </FormGroup>
        </Col>
        <Col sm={12}>
          <hr></hr>
          <Button variant="success" type="submit">
            Join Group Chat
          </Button>
        </Col>
      </Row>
    </Form>
  );
};
export default WaitingRoom;

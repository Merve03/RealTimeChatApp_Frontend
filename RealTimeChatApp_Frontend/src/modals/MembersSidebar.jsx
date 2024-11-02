import PropTypes from "prop-types";
import { Offcanvas, Image } from "react-bootstrap";

const MembersSidebar = ({ isOpen, onClose, members }) => {
  return (
    <Offcanvas show={isOpen} onHide={onClose} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Group Members</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {members.length > 0 ? (
          members.map((member) => (
            <div key={member.memberId} className="mb-3 border-bottom pb-2">
              {member.memberPictureUrl && <Image src={member.memberPictureUrl} roundedCircle style={{ width: "40px", height: "40px", marginRight: "10px" }} />}
              <p>
                <strong>{member.fullname}</strong>
              </p>
              <p>Status: {member.statusMessage || "No status available"}</p>
              <p>{member.isOnline ? "Online" : "Offline"}</p>
            </div>
          ))
        ) : (
          <p>No members available</p>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};

MembersSidebar.propTypes = {
  members: PropTypes.arrayOf(
    PropTypes.shape({
      memberId: PropTypes.string.isRequired,
      fullname: PropTypes.string.isRequired,
      statusMessage: PropTypes.string,
      isOnline: PropTypes.bool.isRequired,
    })
  ).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default MembersSidebar;

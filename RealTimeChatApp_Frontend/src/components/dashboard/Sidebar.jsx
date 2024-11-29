import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const Sidebar = ({ userDetails, loading }) => (
  <div className="bg-light p-3" style={{ width: "200px", height: "100vh" }}>
    <div className="mb-4">
      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : (
        <div>
          <p className="fw-bold">{userDetails.fullname}</p>
          <p className="text-muted">{userDetails.email}</p>
        </div>
      )}
    </div>
    <ul className="list-group">
      <li className="list-group-item">
        <Link to="/user/private-chats" className="text-decoration-none">
          Private Chats
        </Link>
      </li>
      <li className="list-group-item">
        <Link to="/user/friends" className="text-decoration-none">
          Friend List
        </Link>
      </li>
      <li className="list-group-item">
        <Link to="/user/groups" className="text-decoration-none">
          Groups
        </Link>
      </li>
      <li className="list-group-item">
        <Link to="/user/announcements" className="text-decoration-none">
          Announcements
        </Link>
      </li>
    </ul>
  </div>
);

Sidebar.propTypes = {
  userDetails: PropTypes.shape({
    fullname: PropTypes.string.isRequired, // Assuming fullname is required
    email: PropTypes.string.isRequired, // Assuming email is required
  }).isRequired,
  loading: PropTypes.bool.isRequired, // Assuming loading is a required boolean
};

export default Sidebar;

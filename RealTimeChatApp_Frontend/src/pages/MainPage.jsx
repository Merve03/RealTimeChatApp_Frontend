import { useNavigate } from "react-router-dom"; // For navigation
import Register from "../components/Register";

const MainPage = () => {
  const navigate = useNavigate();

  // Function to handle the login button click (navigate to login page)
  const handleLoginRedirect = () => {
    navigate("/login");
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="text-center mb-4">Register</h2>

          {/* Registration Form */}
          <Register />

          {/* Login button */}
          <div className="text-center mt-3">
            <button
              className="btn btn-secondary w-100"
              onClick={handleLoginRedirect}
            >
              Already have an account? Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;

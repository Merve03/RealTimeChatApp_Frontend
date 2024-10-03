import { useNavigate } from "react-router-dom"; // For navigation
import Register from "../components/Register";

const MainPage = () => {
  const navigate = useNavigate();

  // Function to handle the login button click (navigate to login page)
  const handleLoginRedirect = () => {
    navigate("/login");
  };

  return (
    <div className="container-fluid mt-5">
      <div className="row justify-content-center">
        {/* Use a larger column size (col-lg-8 or col-lg-10) */}
        <div className="col-lg-8 col-md-10 col-12 mx-auto">
          {/* Registration Form */}
          <Register />

          {/* Login button */}
          <div className="text-center mt-3">
            Already have an account?
            <button
              className="btn btn-secondary w-100"
              onClick={handleLoginRedirect}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;

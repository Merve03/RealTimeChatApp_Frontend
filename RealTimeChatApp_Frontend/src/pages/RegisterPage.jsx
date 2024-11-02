import { useNavigate } from "react-router-dom"; // For navigation
import Register from "../components/auth/Register";

const RegisterPage = () => {
  const navigate = useNavigate();

  // Function to handle the login button click (navigate to login page)
  const handleLoginRedirect = () => {
    navigate("/login");
  };

  return (
    <div className="container-fluid mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10 col-12 mx-auto">
          {/* Registration Form */}
          <Register />

          {/* Login button */}
          <div className="text-center mt-3">
            Already have an account?
            <button className="btn btn-secondary w-100" onClick={handleLoginRedirect}>
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

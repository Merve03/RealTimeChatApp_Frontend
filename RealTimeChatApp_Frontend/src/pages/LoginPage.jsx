import { useNavigate } from "react-router-dom";
import Login from "../components/Login";
const LoginPage = () => {
  const navigate = useNavigate();

  // Function to handle registration redirect
  const handleRegisterRedirect = () => {
    navigate("/");
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="text-center mb-4">Login</h2>

          {/* Login Form */}
          <Login />

          {/* Register Button */}
          <div className="text-center mt-3">
            <button
              className="btn btn-secondary w-100"
              onClick={handleRegisterRedirect}
            >
              Dont have an account? Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

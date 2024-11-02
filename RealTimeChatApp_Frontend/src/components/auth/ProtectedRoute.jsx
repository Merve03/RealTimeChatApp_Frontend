import { Navigate, useNavigate } from "react-router-dom";
import { TokenService } from "../../services/TokenService";
import { useEffect } from "react";
import setupAxiosInterceptors from "../../utils/axiosSetup";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const isAuthenticated = TokenService.getLocalAccessToken() !== null;

  useEffect(() => {
    if (isAuthenticated) {
      setupAxiosInterceptors(navigate); // pass nav to axios setup
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return <Navigate to={"/login"} replace />;
  }

  return children;
};
export default ProtectedRoute;

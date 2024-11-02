import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

import eyeIcon from "../../assets/eye.svg";
import closedEyeIcon from "../../assets/eye-off.svg";
import { useAuthContext } from "../../utils/AuthProvider";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const validationSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthContext();

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (values, { setSubmitting, setErrors, resetForm }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/account/login`, values);

      if (response.status === 200) {
        const { fullName, accessToken, refreshToken } = response.data.data;
        alert(`Welcome ${fullName}!`);
        login({ fullName, accessToken, refreshToken });

        resetForm();
        navigate("/user");
      } else if (response.status === 400) {
        const serverErrors = response.data.errors || [];
        const formattedErrors = {};
        serverErrors.forEach((err) => {
          if (err.toLowerCase().includes("email")) {
            formattedErrors.email = err;
          } else if (err.toLowerCase().includes("password")) {
            formattedErrors.password = err;
          }
        });
        setErrors(formattedErrors);
      } else if (response.status === 401) {
        setErrors({ email: "Unauthorized: Invalid email or password." });
      } else {
        alert("Login failed. Please check your credentials.");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An unexpected error occurred";
      alert(`Error:${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="text-center mb-4">Login</h2>
          <Formik
            initialValues={{
              email: "",
              password: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="form-group mb-3">
                  <label>Email</label>
                  <Field type="email" name="email" className="form-control" />
                  <ErrorMessage name="email" component="div" className="text-danger" />
                </div>

                <div className="form-group mb-3 position-relative">
                  <label>Password</label>
                  <Field type={showPassword ? "text" : "password"} name="password" className="form-control" />
                  <button type="button" className="btn position-absolute" style={{ right: "10px", top: "50%", transform: "translateY(-50%)" }} onClick={() => setShowPassword((prev) => !prev)}>
                    <img src={showPassword ? closedEyeIcon : eyeIcon} alt={showPassword ? "Hide Password" : "Show Password"} style={{ width: "20px", height: "20px" }} />
                  </button>
                  <ErrorMessage name="password" component="div" className="text-danger" />
                </div>

                <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
                  {isSubmitting ? "Logging in..." : "Login"}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default Login;

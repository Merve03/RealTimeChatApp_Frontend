import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";

import API_BASE_URL from "../config/config";

// Yup validation schema
const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  fullName: Yup.string()
    .max(30, "Full name cannot exceed 30 characters")
    .required("Full name is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords do not match")
    .required("Confirm password is required"),
});

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (
    values,
    { setSubmitting, setErrors, resetForm }
  ) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/account/register`,
        values
      );
      if (response.status === 200) {
        alert("Registration successful!");
        navigate("/login");
        resetForm();
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        const serverErrors = error.response.data.errors; // Assumes error is returned as 'errors'
        const formattedErrors = {}; // For mapping server errors to Formik's fields
        serverErrors.forEach((err, index) => {
          if (err.toLowerCase().includes("email")) {
            formattedErrors.email = err;
          } else if (err.toLowerCase().includes("full name")) {
            formattedErrors.fullName = err;
          } else if (err.toLowerCase().includes("password")) {
            formattedErrors.password = err;
          } else if (err.toLowerCase().includes("confirm password")) {
            formattedErrors.confirmPassword = err;
          }
        });
        setErrors(formattedErrors); // This will set errors to Formik fields
      } else if (error.response.status === 409) {
        // Handle 409 conflict
        const conflictMessage =
          error.response.data.message || "User already exists.";
        setErrors({ email: conflictMessage });
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "An unexpected error occurred";
        alert(`An error occurred during registration: ${errorMessage}`);
      }
    } finally {
      setSubmitting(false); // Formik's method to stop the loading state
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="text-center mb-4">Register</h2>
          <Formik
            initialValues={{
              email: "",
              fullName: "",
              password: "",
              confirmPassword: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                {/* Email Field */}
                <div className="form-group mb-3">
                  <label>Email</label>
                  <Field type="email" name="email" className="form-control" />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-danger"
                  />
                </div>

                {/* Full Name Field */}
                <div className="form-group mb-3">
                  <label>Full Name</label>
                  <Field type="text" name="fullName" className="form-control" />
                  <ErrorMessage
                    name="fullName"
                    component="div"
                    className="text-danger"
                  />
                </div>

                {/* Password Field */}
                <div className="form-group mb-3 position-relative">
                  <label>Password</label>
                  <Field
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="form-control"
                  />
                  <button
                    type="button"
                    className="btn btn-secondary position-absolute end-0 top-0 mt-2 me-2"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-danger"
                  />
                </div>
                {/* Confirm Password Field */}
                <div className="form-group mb-3 position-relative">
                  <label>Confirm Password</label>
                  <Field
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    className="form-control"
                  />
                  <button
                    type="button"
                    className="btn btn-secondary position-absolute end-0 top-0 mt-2 me-2"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                  <ErrorMessage
                    name="confirmPassword"
                    component="div"
                    className="text-danger"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Registering..." : "Register"}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default Register;

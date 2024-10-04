import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (
    values,
    { setSubmitting, setErrors, resetForm }
  ) => {
    try {
      const response = await axios.post(
        "https://localhost:7210/api/account/login",
        values
      );

      if (response.status === 200) {
        const { userId, accessToken, refreshToken } = response.data.data;
        alert(`Login successful! User ID: ${userId}`);
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        resetForm();
      } else {
        alert("Login failed. Please check your credentials.");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An unexpected error occurred";
      const serverErrors = error.response?.data?.errors || [];

      if (error.response?.status === 401) {
        alert("Unauthorized: Invalid email or password.");
      } else if (error.response?.status === 400) {
        const formattedErrors = {};
        serverErrors.forEach((err) => {
          if (err.toLowerCase().includes("email")) {
            formattedErrors.email = err;
          } else if (err.toLowerCase().includes("password")) {
            formattedErrors.password = err;
          }
        });
        setErrors(formattedErrors);
      } else {
        alert(`Error: ${errorMessage}`);
      }
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
                    onClick={() => setShowPassword((prev) => !prev)} // toggle the show password state
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                  <ErrorMessage
                    name="password"
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

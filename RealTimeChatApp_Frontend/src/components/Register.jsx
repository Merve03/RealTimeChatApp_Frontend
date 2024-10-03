import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

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
  const handleSubmit = async (values, { resetForm }) => {
    try {
      const response = await axios.post(
        "https://localhost:7210/api/account/register",
        values
      );
      if (response.status === 200) {
        alert("Registration successful!");
        resetForm(); // Reset form after successful submission
      } else {
        alert("Registration failed. Please try again.");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred";
      alert(`An error occurred during registration: ${errorMessage}`);
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
                <div className="form-group mb-3">
                  <label>Password</label>
                  <Field
                    type="password"
                    name="password"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-danger"
                  />
                </div>

                {/* Confirm Password Field */}
                <div className="form-group mb-3">
                  <label>Confirm Password</label>
                  <Field
                    type="password"
                    name="confirmPassword"
                    className="form-control"
                  />
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

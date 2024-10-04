import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MainPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import "bootstrap/dist/css/bootstrap.min.css";
import RegisterPage from "./pages/RegisterPage";

function App() {
  return (
    <div className="container-fluid d-flex justify-content-center align-items-center vh-100 p-3 bg-light">
      <Router>
        <div className="w-100" style={{ maxWidth: "1200px" }}>
          <Routes>
            <Route path="/" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;

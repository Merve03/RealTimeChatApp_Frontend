import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const useAuth = () => {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const fetchUserId = async () => {
      setAuthError(""); // Clear previous errors
      try {
        const response = await axios.get(`${API_BASE_URL}/user/user-id`);
        if (response.status === 200) {
          setCurrentUserId(response.data.data);
        }
      } catch (error) {
        setAuthError("Error fetching authenticated user ID: " + (error.response?.data?.message || error.message));
      }
    };
    fetchUserId();
  }, []);

  return { currentUserId, authError };
};

export default useAuth;

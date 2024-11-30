import axios from "axios";
import { IP_ADDRESS } from "@env";

const DRIVER_API_URL = `https://flexiride.onrender.com/driver/`;
const AUTH_API_URL = `https://flexiride.onrender.com/auth/`;

const registerDriver = async (driverData) => {
  try {
    const response = await axios.post(`${DRIVER_API_URL}register`, driverData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error during driver registration:", error);
    throw error;
  }
};

// Function to update the password for a given email
const updatePassword = async (email, newPassword) => {
  try {
    const response = await axios.put(
      `${AUTH_API_URL}forgot-password`,
      { email, newPassword },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating password:", error);
    throw error;
  }
};

const changeDriverPassword = async (driverId, newPassword, token) => {
  try {
    const response = await axios.post(
      `${DRIVER_API_URL}change-password/${driverId}`,
      { newPassword },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Pass the Bearer token here
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error changing password:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export { registerDriver, updatePassword, changeDriverPassword };

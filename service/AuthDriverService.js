import axios from "axios";
import { API_URL_IP_ADDRESS } from "@env";

const DRIVER_API_URL = `http://${API_URL_IP_ADDRESS}:3000/driver/`;
const AUTH_API_URL = `http://${API_URL_IP_ADDRESS}:3000/auth/`;

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

export { registerDriver, updatePassword };

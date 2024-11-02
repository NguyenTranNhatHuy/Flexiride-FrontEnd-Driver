import axios from "axios";

const AUTH_API_URL = "http://192.168.1.5:3000/driver/";

const registerDriver = async (driverData) => {
  try {
    const response = await axios.post(`${AUTH_API_URL}register`, driverData, {
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

export default registerDriver; // Ensure that the function is exported

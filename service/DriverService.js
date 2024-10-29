import axios from "axios";

const DRIVER_API_URL = "http://192.168.1.3:3000/driver/";

const getAllDrivers = async () => {
  try {
    const response = await axios.get(`${DRIVER_API_URL}drivers`);
    if (response.status === 200) {
      return response.data.data; 
    } else {
      throw new Error("Failed to fetch drivers");
    }
  } catch (error) {
    console.error("Error fetching drivers:", error.message);
    throw error; 
  }
};

export default getAllDrivers;

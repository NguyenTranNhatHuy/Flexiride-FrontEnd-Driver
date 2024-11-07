import axios from "axios";
import { API_URL_IP_ADDRESS } from "@env";

const DRIVER_API_URL = `http://${API_URL_IP_ADDRESS}:3000/driver/`;

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

const getDriverById = async (driverId) => {
  try {
    const response = await axios.get(`${DRIVER_API_URL}${driverId}`);
    if (response.status === 200) {
      return response.data.data; // Return the driver data
    } else {
      throw new Error("Failed to fetch driver");
    }
  } catch (error) {
    console.error("Error fetching driver by ID:", error.message);
    throw error; // Rethrow the error to be handled elsewhere
  }
};

export { getAllDrivers, getDriverById };

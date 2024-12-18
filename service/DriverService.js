import axios from "axios";
import { IP_ADDRESS } from "@env";

const DRIVER_API_URL = `https://flexiride.onrender.com/driver/`;

const getAllDrivers = async () => {
  console.log(IP_ADDRESS);
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
    const response = await axios.get(`${DRIVER_API_URL}drivers/${driverId}`);
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

const updateDriver = async (driverId, updateData, token) => {
  try {
    const response = await axios.put(
      `${DRIVER_API_URL}update-driver/${driverId}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Attach Bearer Token
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      return response.data; // Return the updated driver data
    } else {
      throw new Error("Failed to update driver");
    }
  } catch (error) {
    console.error("Error updating driver:", error.message);
    throw error;
  }
};

export { getAllDrivers, getDriverById, updateDriver };

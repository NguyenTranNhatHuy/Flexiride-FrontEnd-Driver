import axios from "axios";
import { IP_ADDRESS } from "@env";

// const DOMAIN = 'http://192.168.111.52:3000/booking-carpool'; // Add /booking-carpool to the base URL
const DOMAIN = `https://flexiride.onrender.com/booking-carpool`;

// Create Axios instances with tokens passed as arguments
const createApiInstance = (token) => {
  return axios.create({
    baseURL: DOMAIN,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

// Customer API calls
const createCarpoolRequest = async (data, customerToken) => {
  const customerApi = createApiInstance(customerToken);
  try {
    const response = await customerApi.post("/create-request", data);
    if (response.status === 200) {
      return response;
    } else {
      throw new Error("Failed to create carpool request");
    }
  } catch (error) {
    console.error("Error creating carpool request:", error.message);
    throw error;
  }
};

const getAvailableRides = async (params, customerToken) => {
  const customerApi = createApiInstance(customerToken);
  try {
    const response = await customerApi.get("/available-rides", { params });
    if (response.status === 200) {
      return response;
    } else {
      throw new Error("Failed to fetch available rides");
    }
  } catch (error) {
    console.error("Error fetching available rides:", error.message);
    throw error;
  }
};

const joinCarpoolRequest = async (requestId, location, customerToken) => {
  const customerApi = createApiInstance(customerToken);
  try {
    const response = await customerApi.post(
      `/join-request/${requestId}`,
      location
    );
    if (response.status === 200) {
      return response;
    } else {
      throw new Error("Failed to join carpool request");
    }
  } catch (error) {
    console.error("Error joining carpool request:", error.message);
    throw error;
  }
};

const cancelCarpoolRequest = async (requestId, customerToken) => {
  const customerApi = createApiInstance(customerToken);
  try {
    const response = await customerApi.post(`/unjoin-request/${requestId}`);
    if (response.status === 200) {
      return response;
    } else {
      throw new Error("Failed to cancel carpool request");
    }
  } catch (error) {
    console.error("Error canceling carpool request:", error.message);
    throw error;
  }
};

const getCustomerRides = async (customerToken) => {
  const customerApi = createApiInstance(customerToken);
  try {
    const response = await customerApi.get("/my-rides");
    if (response.status === 200) {
      return response;
    } else {
      throw new Error("Failed to fetch customer rides");
    }
  } catch (error) {
    console.error("Error fetching customer rides:", error.message);
    throw error;
  }
};

const getCustomerNotifications = async (customerToken) => {
  const customerApi = createApiInstance(customerToken);
  try {
    const response = await customerApi.get("/notification/");
    if (response.status === 200) {
      return response;
    } else {
      throw new Error("Failed to fetch customer notifications");
    }
  } catch (error) {
    console.error("Error fetching customer notifications:", error.message);
    throw error;
  }
};

const submitFeedback = async (driverId, feedbackData, customerToken) => {
  const customerApi = createApiInstance(customerToken);
  try {
    const response = await customerApi.post(
      `/feedback/${driverId}`,
      feedbackData
    );
    if (response.status === 200) {
      return response;
    } else {
      throw new Error("Failed to submit feedback");
    }
  } catch (error) {
    console.error("Error submitting feedback:", error.message);
    throw error;
  }
};

// Driver API calls
const getDriverAvailableRides = async (driverToken) => {
  const driverApi = createApiInstance(driverToken);
  try {
    const response = await driverApi.get("/driver-rides/get-request");
    if (response.status === 200) {
      return response;
    } else {
      throw new Error("Failed to fetch available rides for driver");
    }
  } catch (error) {
    console.error("Error fetching available rides for driver:", error.message);
    throw error;
  }
};

const acceptCarpoolRequest = async (requestId, driverToken) => {
  const driverApi = createApiInstance(driverToken);
  try {
    const response = await driverApi.post(`/accept-request/${requestId}`);
    if (response.status === 200) {
      return response;
    } else {
      throw new Error("Failed to accept carpool request");
    }
  } catch (error) {
    console.error("Error accepting carpool request:", error.message);
    throw error;
  }
};

const getDriverRides = async (driverToken) => {
  const driverApi = createApiInstance(driverToken);
  try {
    const response = await driverApi.get("/driver-rides");
    if (response.status === 200) {
      return response;
    } else {
      throw new Error("Failed to fetch driver rides");
    }
  } catch (error) {
    console.error("Error fetching driver rides:", error.message);
    throw error;
  }
};

const updatePickupProgress = async (rideId, customerId, driverToken) => {
  const driverApi = createApiInstance(driverToken);
  try {
    const response = await driverApi.put(
      `/driver-rides/${rideId}/pickup/${customerId}`
    );
    if (response.status === 200) {
      return response;
    } else {
      throw new Error("Failed to update pickup progress");
    }
  } catch (error) {
    console.error("Error updating pickup progress:", error.message);
    throw error;
  }
};

const getCustomerStatusPickup = async (rideId, driverToken) => {
  const driverApi = createApiInstance(driverToken);
  try {
    const response = await driverApi.get(`/driver-rides/${rideId}`);
    if (response.status === 200) {
      return response;
    } else {
      throw new Error("Failed to fetch customer status");
    }
  } catch (error) {
    console.error("Error fetching customer status:", error.message);
    throw error;
  }
};

const updateStartStatusRequest = async (rideId, driverToken) => {
  const driverApi = createApiInstance(driverToken);
  try {
    const response = await driverApi.put(`/driver-rides/${rideId}/start`);
    if (response.status === 200) {
      return response;
    } else {
      throw new Error("Failed to update start status");
    }
  } catch (error) {
    console.error("Error updating start status:", error.message);
    throw error;
  }
};

const updateCompleteStatusRequest = async (rideId, driverToken) => {
  const driverApi = createApiInstance(driverToken);
  try {
    console.log("checking");
    const response = await driverApi.put(`/driver-rides/${rideId}/complete`);
    if (response.status === 200) {
      return response;
    } else {
      throw new Error("Failed to update complete status");
    }
  } catch (error) {
    console.error("Error updating complete status:", error.message);
    throw error;
  }
};

// Exporting functions
export {
  createCarpoolRequest,
  getAvailableRides,
  joinCarpoolRequest,
  cancelCarpoolRequest,
  getCustomerRides,
  getCustomerNotifications,
  submitFeedback,
  getDriverAvailableRides,
  acceptCarpoolRequest,
  getDriverRides,
  updatePickupProgress,
  getCustomerStatusPickup,
  updateStartStatusRequest,
  updateCompleteStatusRequest,
};

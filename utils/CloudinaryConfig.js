import axios from "axios";

export const CLOUDINARY_URL =
  "https://api.cloudinary.com/v1_1/dmjpvtlt8/image/upload";
export const CLOUDINARY_UPLOAD_PRESET = "uploadCloudinary"; // Your upload preset

export const uploadImageToCloudinary = async (selectedImage) => {
  const data = new FormData();
  data.append("file", {
    uri: selectedImage,
    type: "image/jpeg", // Adjust according to the actual image type
    name: "image.jpg", // You can use different names for each image
  });
  data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await axios.post(CLOUDINARY_URL, data, {
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.secure_url; // Return the uploaded image's URL
  } catch (error) {
    const errorMessage = error.response
      ? error.response.data.message
      : error.message;
    throw new Error("Error uploading image: " + errorMessage);
  }
};

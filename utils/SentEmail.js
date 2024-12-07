import { Alert } from "react-native";
import { IP_ADDRESS } from "@env";

const sendEmail = async (name, email, otpCode) => {
  console.log("API: " + IP_ADDRESS);
  try {
    const response = await fetch(
      `https://flexiride.onrender.com/driver/send-email`,

      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, otpCode }),
      }
    );

    const result = await response.json();
    console.log(result.message);
    if (response.ok) {
      Alert.alert("Thành công", "Email đã được gửi thành công!");
    } else {
      Alert.alert("Lỗi", result.message || "Không thể gửi email.");
    }
  } catch (error) {}
};

export default sendEmail;

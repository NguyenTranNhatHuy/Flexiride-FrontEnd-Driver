import { Alert } from "react-native";

const sendEmail = async (name, email, otpCode) => {
  try {
    const response = await fetch("http://192.168.1.5:3000/driver/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, otpCode }),
    });

    const result = await response.json();
    console.log(result.message);
    if (response.ok) {
      Alert.alert("Thành công", "Email đã được gửi thành công!");
    } else {
      Alert.alert("Lỗi", result.message || "Không thể gửi email.");
    }
  } catch (error) {
    // console.error("Lỗi khi gửi email:", error);
    // Alert.alert("Lỗi", "Có lỗi xảy ra khi gửi email.");
  }
};

export default sendEmail;

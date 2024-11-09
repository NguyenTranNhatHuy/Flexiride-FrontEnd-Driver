import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import sendEmail from "../../utils/SentEmail";
import { generateOtpCode } from "../../common/GenerateOtpCode";
import getAllDrivers from "../../service/DriverService";

const ForgotPasswordDriver = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});

  const validateEmail = (input) => {
    const emailRegex = /^[a-zA-Z][^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input);
  };

  const handleContinue = async () => {
    let newErrors = {};

    // Email validation
    if (!email) {
      newErrors.email = "Vui lòng nhập email.";
    } else if (!validateEmail(email)) {
      newErrors.email = "Email không hợp lệ.";
    } else {
      try {
        // Check if the email already exists in the system
        const drivers = await getAllDrivers();
        const emailExists = drivers.some(
          (driver) => driver.personalInfo.email === email
        );

        if (!emailExists) {
          newErrors.email = "Email không tồn tại trong ứng dụng.";
        }
      } catch (error) {
        // console.error("Failed to check existing email:", error);
        // Alert.alert("Lỗi", "Đã xảy ra lỗi khi kiểm tra email.");
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const otpCode = generateOtpCode();
        const name = "User"; // Placeholder for name
        sendEmail(name, email, otpCode);
        navigation.navigate("EnterOtp", { otpCode, name, email });
      } catch (error) {
        Alert.alert("Lỗi", "Đã xảy ra lỗi khi gửi mã OTP.");
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "android" ? "height" : null}
    >
      <TouchableOpacity style={styles.backButton}>
        <Icon
          onPress={() => navigation.navigate("Login")}
          name="arrow-left"
          size={20}
          color="black"
        />
      </TouchableOpacity>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.headerText}>
            Bạn quên mật khẩu của chính mình?
          </Text>
          <Text style={styles.subHeaderText}>
            Cung cấp cho chúng tôi email của bạn.
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              onChangeText={setEmail}
              value={email}
              placeholder="Email *"
              keyboardType="email-address"
              placeholderTextColor="#6D6A6A"
            />
            {errors.email && (
              <Text style={styles.errorMessage}>{errors.email}</Text>
            )}
          </View>

          <TouchableOpacity style={styles.button} onPress={handleContinue}>
            <Text style={styles.buttonText}>Tiếp tục</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFC323",
    alignItems: "stretch",
    justifyContent: "flex-start",
    paddingTop: 30,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  inputContainer: {
    width: "100%",
  },
  content: {
    width: "100%",
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginBottom: 300,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
    textAlign: "left",
  },
  subHeaderText: {
    fontSize: 16,
    textAlign: "left",
    paddingHorizontal: 0,
    fontWeight: "300",
    marginBottom: 10,
  },
  input: {
    height: 50,
    marginHorizontal: 0,
    borderWidth: 1,
    padding: 10,
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderColor: "#6C6A6A",
    margin: 20,
  },
  button: {
    backgroundColor: "#270C6D",
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "flex-end",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  errorMessage: {
    color: "red",
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
    padding: 10,
    marginTop: -20,
    width: 50,
  },
});

export default ForgotPasswordDriver;

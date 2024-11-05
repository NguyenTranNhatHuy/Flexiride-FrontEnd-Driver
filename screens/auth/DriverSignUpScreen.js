import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getAllDrivers from "../../service/DriverService";
import axios from "axios";
const { height } = Dimensions.get("window");

const DriverSignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateEmail = (input) => {
    const emailRegex = /^[a-zA-Z][^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input);
  };

  const validatePassword = (input) => {
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,12}$/;
    return passwordRegex.test(input);
  };

  const verifyEmail = async (email) => {
    try {
      const response = await axios.get(
        `https://emailvalidation.abstractapi.com/v1/?api_key=20dde04ff65b4eeeaaad784643b8ff30&email=${email}`
      );
      const { deliverability } = response.data;
      return deliverability === "DELIVERABLE";
    } catch (error) {
      // console.error("Error verifying email:", error);
      return false;
    }
  };

  const handleContinue = async () => {
    let valid = true;

    // Validate email
    if (!email) {
      setEmailError("Email không được để trống.");
      valid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Email không hợp lệ.");
      valid = false;
    } else {
      setEmailError("");
    }

    // Validate password
    if (!password) {
      setPasswordError("Mật khẩu không được để trống.");
      valid = false;
    } else if (!validatePassword(password)) {
      setPasswordError(
        "Mật khẩu phải có 8-12 ký tự, bao gồm chữ hoa, số và ký tự đặc biệt."
      );
      valid = false;
    } else {
      setPasswordError("");
    }

    if (valid) {
      const isEmailValid = await verifyEmail(email);
      // if (!isEmailValid) {
      //   setEmailError("Email không khả dụng hoặc không tồn tại.");
      //   return;
      // }

      try {
        const driverList = await getAllDrivers();
        if (!Array.isArray(driverList)) {
          setEmailError("Không thể kết nối đến dịch vụ. Vui lòng thử lại sau.");
          return;
        }

        const emails = driverList.map((driver) => driver.personalInfo.email);
        if (emails.includes(email)) {
          setEmailError("Email đã được sử dụng trong ứng dụng.");
          return;
        }

        const userInfo = {
          email: email,
          password: password,
        };

        await AsyncStorage.setItem("personalInfo", JSON.stringify(userInfo));
        console.log("Email and password saved:", userInfo);

        navigation.navigate("DriverTemp");
      } catch (e) {
        console.error("Lỗi khi kiểm tra hoặc lưu email:", e);
      }
    }
  };
  

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "android" ? "height" : null}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.headerText}>Trở thành đối tác của FRide</Text>
          <Text style={styles.subHeaderText}>Mang lại niềm vui </Text>
          <Text style={styles.subHeaderText}>sự thuận tiện cho khách hàng!</Text>
          <View style={styles.googleSignUpContainer}>
            <View style={styles.line} />
            <Text style={styles.googleText}>Đăng ký tài khoản</Text>
            <View style={styles.line} />
          </View>

          {/* Email Input */}
          <TextInput
            style={[styles.input, emailError ? styles.inputError : null]}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError(""); // Xóa lỗi khi người dùng bắt đầu nhập
            }}
            value={email}
            placeholder="Email"
            keyboardType="email-address"
            placeholderTextColor="#6D6A6A"
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          {/* Password Input */}
          <TextInput
            style={[styles.input, passwordError ? styles.inputError : null]}
            onChangeText={(text) => {
              setPassword(text);
              setPasswordError(""); // Xóa lỗi khi người dùng bắt đầu nhập
            }}
            value={password}
            placeholder="Mật khẩu"
            secureTextEntry={true}
            placeholderTextColor="#6D6A6A"
          />
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

          {/* Continue Button */}
          <TouchableOpacity style={styles.button} onPress={handleContinue}>
            <Text style={styles.buttonText}>Tiếp tục</Text>
          </TouchableOpacity>
        </View>

        {/* Image Section */}
        <View style={styles.imageContainer}>
          <Image
            style={styles.image}
            source={require("../../assets/splash.png")}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFC323",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
    textAlign: "left",
  },
  subHeaderText: {
    fontSize: 24,
    textAlign: "left",
    fontWeight: "bold",
  },
  googleSignUpContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 50,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "black",
  },
  googleText: {
    fontSize: 16,
    paddingHorizontal: 10,
  },
  input: {
    height: 50,
    borderWidth: 1,
    padding: 10,
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginTop: 20,
    borderColor: "#6C6A6A",
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    marginTop: 5,
  },
  button: {
    backgroundColor: "#270C6D",
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 50,
    alignSelf: "flex-end",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  imageContainer: {
    height: height * 0.25, // Set the height to 25% of the screen height
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  image: {
    width: "100%",
    height: "150%",
    resizeMode: "stretch", // Ensure the image fits within the container
  },
});

export default DriverSignUpScreen;

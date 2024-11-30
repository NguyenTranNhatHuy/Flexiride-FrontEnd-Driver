import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import axios from "axios";
import { useAuth } from "../../provider/AuthProvider"; // Import hook xác thực
import { IP_ADDRESS } from "@env";

export default function Login({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { authenticate } = useAuth(); // Hook dùng để xác thực người dùng

  const validateForm = () => {
    const newErrors = {};

    // Phone number validation
    if (!/^\d{10}$/.test(phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại phải là 10 chữ số.";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Mật khẩu là bắt buộc.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  // console.log("API: " + IP_ADDRESS);
  const handleSubmit = async () => {
    if (validateForm()) {
      setIsLoading(true);
      const loginData = {
        phone: phoneNumber,
        password: password,
        role: "2",
      };
      try {
        console.log(IP_ADDRESS)
        const response = await axios.post(
          `http://${IP_ADDRESS}:3000/auth/login`,
          loginData
        );
        if (response.data.token) {
          if (response.data.user.approve) {
            await authenticate({
              token: response.data.token,
              user: response.data.user,
            });
            navigation.navigate("DriverScreen");
            // navigation.navigate("DriverProfile");
          } else {
            setErrors({ general: "Tài khoản chưa được phê duyệt." });
          }
        } else {
          setErrors({ general: "Số điện thoại hoặc mật khẩu không đúng." });
        }
      } catch (error) {
        // console.error("Error during login:", error);
        setErrors({
          general: "Số điện thoại hoặc mật khẩu không đúng.",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "android" ? "height" : null}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/FRide.png")}
            style={styles.logo}
          />
          <Image
            source={require("../../assets/Driver.png")}
            style={styles.logo}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Số điện thoại"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            style={styles.input}
            keyboardType="phone-pad"
            autoCapitalize="none"
            placeholderTextColor="#6D6A6A"
          />
          {errors.phoneNumber && (
            <Text style={styles.errorText}>{errors.phoneNumber}</Text>
          )}

          <TextInput
            placeholder="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry={true}
            placeholderTextColor="#6D6A6A"
          />
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}

          {errors.general && (
            <Text style={styles.errorText}>{errors.general}</Text>
          )}
          <View style={styles.forgotPasswordContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate("ForgotPasswordDriver")}
            >
              <Text style={styles.forgotPassword}>Quên mật khẩu</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Đang đăng nhập..." : "ĐĂNG NHẬP"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("DriverSignUpScreen")}
        >
          <Text style={styles.signUpText}>Chưa có tài khoản? Đăng ký</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFC323",
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
    width: 200,
    height: 200,
  },
  logo: {
    resizeMode: "contain",
  },
  inputContainer: {
    width: "80%",
  },
  input: {
    height: 40,
    borderColor: "#6C6A6A",
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  forgotPasswordContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  forgotPassword: {
    color: "black",
  },
  button: {
    width: "80%",
    height: 40,
    backgroundColor: "#270C6D",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  signUpText: {
    color: "black",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
  },
});

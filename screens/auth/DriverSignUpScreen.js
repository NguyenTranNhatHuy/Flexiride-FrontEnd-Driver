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

    // If validation passes, save the data
    if (valid) {
      const userInfo = {
        email: email,
        password: password, // Save the password as entered
      };

      // Log the userInfo object to ensure it's correctly set
      console.log("UserInfo object:", userInfo);

      try {
        await AsyncStorage.setItem("personalInfo", JSON.stringify(userInfo));
        console.log("Email and password saved:", userInfo);

        // Retrieve and log the saved email and password from AsyncStorage
        // const storedUserInfo = await AsyncStorage.getItem("personalInfo");
        // if (storedUserInfo !== null) {
        //   const parsedUserInfo = JSON.parse(storedUserInfo);
        //   console.log("Retrieved from AsyncStorage:", parsedUserInfo);
        // } else {
        //   console.log("No data found in AsyncStorage.");
        // }

        // Navigate to the next screen
        navigation.navigate('DriverTemp');
      } catch (e) {
        console.error("Failed to save email and password to AsyncStorage:", e);
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
        <View style={styles.content}>
          <Text style={styles.headerText}>Trở thành đối tác của FRide</Text>
          <Text style={styles.subHeaderText}>Mang lại niềm vui </Text>
          <Text style={styles.subHeaderText}>
            sự thuận tiện cho khách hàng!
          </Text>
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
              setEmailError(""); // Clear error when user starts typing
            }}
            value={email}
            placeholder="Email"
            keyboardType="email-address"
            placeholderTextColor="#6D6A6A"
          />
          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}

          {/* Password Input */}
          <TextInput
            style={[styles.input, passwordError ? styles.inputError : null]}
            onChangeText={(text) => {
              setPassword(text);
              setPasswordError(""); // Clear error when user starts typing
            }}
            value={password}
            placeholder="Mật khẩu"
            secureTextEntry={true}
            placeholderTextColor="#6D6A6A"
          />
          {passwordError ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}

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

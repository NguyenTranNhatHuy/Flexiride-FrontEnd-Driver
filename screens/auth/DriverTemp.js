import React, { useState, useEffect } from "react";
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
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import { getAllDrivers } from "../../service/DriverService";
import axios from "axios";
import sendEmail from "../../utils/SentEmail";
import { generateOtpCode } from "../../common/GenerateOtpCode";

const DriverTemp = ({ navigation }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [isChecked, setIsChecked] = useState(false);

  // State to track error messages
  const [errors, setErrors] = useState({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // List of all provinces/cities in Vietnam
  const cities = [
    "An Giang",
    "Bà Rịa - Vũng Tàu",
    "Bạc Liêu",
    "Bắc Giang",
    "Bắc Kạn",
    "Bắc Ninh",
    "Bến Tre",
    "Bình Dương",
    "Bình Định",
    "Bình Phước",
    "Bình Thuận",
    "Cà Mau",
    "Cần Thơ",
    "Cao Bằng",
    "Đà Nẵng",
    "Đắk Lắk",
    "Đắk Nông",
    "Điện Biên",
    "Đồng Nai",
    "Đồng Tháp",
    "Gia Lai",
    "Hà Giang",
    "Hà Nam",
    "Hà Nội",
    "Hà Tĩnh",
    "Hải Dương",
    "Hải Phòng",
    "Hậu Giang",
    "Hòa Bình",
    "Hưng Yên",
    "Khánh Hòa",
    "Kiên Giang",
    "Kon Tum",
    "Lai Châu",
    "Lạng Sơn",
    "Lào Cai",
    "Lâm Đồng",
    "Long An",
    "Nam Định",
    "Nghệ An",
    "Ninh Bình",
    "Ninh Thuận",
    "Phú Thọ",
    "Phú Yên",
    "Quảng Bình",
    "Quảng Nam",
    "Quảng Ngãi",
    "Quảng Ninh",
    "Quảng Trị",
    "Sóc Trăng",
    "Sơn La",
    "Tây Ninh",
    "Thái Bình",
    "Thái Nguyên",
    "Thanh Hóa",
    "Thừa Thiên Huế",
    "Tiền Giang",
    "TP. Hồ Chí Minh",
    "Trà Vinh",
    "Tuyên Quang",
    "Vĩnh Long",
    "Vĩnh Phúc",
    "Yên Bái",
  ];
  // Fetch email and password from AsyncStorage when component mounts
  useEffect(() => {
    const fetchPersonalInfo = async () => {
      try {
        const storedInfo = await AsyncStorage.getItem("personalInfo");
        if (storedInfo !== null) {
          const parsedInfo = JSON.parse(storedInfo);
          setEmail(parsedInfo.email);
          setPassword(parsedInfo.password);
        }
      } catch (e) {
        console.error("Failed to load personal info:", e);
      }
    };

    fetchPersonalInfo();
  }, []);

  const formatPhoneNumber = (number) => {
    if (number.startsWith("0") && number.length === 10) {
      return `84${number.slice(1)}`;
    }
    return number;
  };

  const validatePhone = async (phone) => {
    try {
      const phoneNumber = formatPhoneNumber(phone);
      const response = await axios.get(
        `https://phonevalidation.abstractapi.com/v1/?api_key=d70746d2ef17484893193d81af4e39c6&phone=${phoneNumber}`
      );
      return response.data.valid;
    } catch (error) {
      // console.error("Error verifying phone:", error);
      return false;
    }
  };

  const handleContinue = async () => {
    let newErrors = {};
    const phoneNumberRegex = /^0[0-9]{9}$/; // Phone number must start with 0 and have 10 digits

    // Validation checks
    if (!lastName) {
      newErrors.lastName = "Vui lòng nhập tên.";
    }
    // else if (/[^A-Za-z\s]/.test(lastName)) {
    //   newErrors.lastName = "Tên không được chứa số hoặc ký tự đặc biệt.";
    // }

    if (!firstName) {
      newErrors.firstName = "Vui lòng nhập họ.";
    }
    // else if (/[^A-Za-z\s]/.test(firstName)) {
    //   newErrors.firstName = "Họ không được chứa số hoặc ký tự đặc biệt.";
    // }

    if (!phoneNumber) {
      newErrors.phoneNumber = "Số điện thoại không được để trống.";
    } else if (!phoneNumberRegex.test(phoneNumber)) {
      newErrors.phoneNumber =
        "Vui lòng nhập số điện thoại bắt đầu bằng 0 và gồm 10 chữ số.";
    } else if (!(await validatePhone(phoneNumber))) {
      newErrors.phoneNumber = "Số điện thoại không hợp lệ.";
    } else {
      // Check if phone number already exists using getAllDriver method
      try {
        const existingDrivers = await getAllDrivers(); // Giả sử phương thức này trả về danh sách tài xế
        const phoneExists = existingDrivers.some(
          (driver) => driver.personalInfo.phoneNumber === phoneNumber
        );

        if (phoneExists) {
          newErrors.phoneNumber = "Số điện thoại này đã tồn tại.";
        }
      } catch (e) {
        console.error("Failed to check existing phone number:", e);
      }
    }

    if (!selectedCity) {
      newErrors.city = "Vui lòng chọn thành phố.";
    }
    if (!selectedGender) {
      newErrors.gender = "Vui lòng chọn giới tính.";
    }

    setErrors(newErrors);

    // If no errors, proceed to save information
    if (Object.keys(newErrors).length === 0) {
      if (!isChecked) {
        Alert.alert(
          "Thông báo",
          "Vui lòng đồng ý với các điều khoản và điều kiện."
        );
        return;
      }

      try {
        // Retrieve current personal info, if available
        const storedInfo = await AsyncStorage.getItem("personalInfo");
        let updatedInfo = storedInfo ? JSON.parse(storedInfo) : {};

        // Update with new values
        updatedInfo = {
          ...updatedInfo,
          firstName: firstName,
          lastName: lastName,
          phoneNumber: phoneNumber,
          city: selectedCity,
          gender: selectedGender,
        };

        // Save the updated info to AsyncStorage
        await AsyncStorage.setItem("personalInfo", JSON.stringify(updatedInfo));
        console.log("Updated personalInfo saved:", updatedInfo);

        // Navigate to the next screen
        const otpCode = generateOtpCode();
        const name = firstName + lastName;
        const email = updatedInfo.email;
        sendEmail(name, email, otpCode);
        // console.log("code: ", generateOtpCode());
        navigation.navigate("InsertCode", { otpCode, name });
      } catch (e) {
        console.error("Failed to update and save personal info:", e);
      }
    }
  };

  const toggleCheckbox = () => {
    setIsChecked(!isChecked);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "android" ? "height" : null}
    >
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton}>
        <Icon
          onPress={() => navigation.navigate("DriverSignUpScreen")}
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
          <Text style={styles.headerText}>Đăng ký tài xế mới!</Text>
          <Text style={styles.subHeaderText}>
            Vui lòng cho chúng tôi biết về bạn
          </Text>

          <View style={styles.inputContainer}>
            {/* Tên Input */}
            <TextInput
              style={styles.input}
              onChangeText={setLastName}
              value={lastName}
              placeholder="Tên *"
              keyboardType="default"
              autoCapitalize="words"
              placeholderTextColor="#6D6A6A"
            />
            {errors.lastName && (
              <Text style={styles.errorMessage}>{errors.lastName}</Text>
            )}

            {/* Họ Input */}
            <TextInput
              placeholder="Họ *"
              style={styles.input}
              onChangeText={setFirstName}
              value={firstName}
              keyboardType="default"
              autoCapitalize="words"
              placeholderTextColor="#6D6A6A"
            />
            {errors.firstName && (
              <Text style={styles.errorMessage}>{errors.firstName}</Text>
            )}

            {/* Số điện thoại Input */}
            <TextInput
              placeholder="Số điện thoại *"
              style={styles.input}
              onChangeText={setPhoneNumber}
              value={phoneNumber}
              keyboardType="phone-pad"
              autoCapitalize="none"
              placeholderTextColor="#6D6A6A"
            />
            {errors.phoneNumber && (
              <Text style={styles.errorMessage}>{errors.phoneNumber}</Text>
            )}

            {/* Thành phố Picker */}
            <Text style={styles.label}>Thành phố *</Text>
            <Picker
              selectedValue={selectedCity}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedCity(itemValue)}
            >
              <Picker.Item label="Chọn thành phố" value="" />
              {cities.map((city, index) => (
                <Picker.Item key={index} label={city} value={city} />
              ))}
            </Picker>
            {errors.city && (
              <Text style={styles.errorMessage}>{errors.city}</Text>
            )}
            <Text style={styles.label}>Giới tính *</Text>
            <Picker
              selectedValue={selectedGender}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedGender(itemValue)}
            >
              <Picker.Item label="Chọn giới tính" value="" />
              <Picker.Item label="Nam" value="Nam" />
              <Picker.Item label="Nữ" value="Nữ" />
              <Picker.Item label="Khác" value="Khác" />
            </Picker>
            {errors.gender && (
              <Text style={styles.errorMessage}>{errors.gender}</Text>
            )}
          </View>

          {/* Checkbox and Continue Button */}
          <View style={styles.checkboxContainer}>
            <TouchableOpacity onPress={toggleCheckbox} style={styles.checkbox}>
              {isChecked && <Icon name="check" size={16} color="green" />}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>
              Bằng cách tiếp tục, tôi đồng ý FRide có thể thu thập, sử dụng và
              tiết lộ thông tin do tôi cung cấp theo thông báo về quyền riêng
              tư. Tôi cũng xác nhận đã đọc hiểu rõ và hoàn toàn tuân thủ các
              điều khoản và điều kiện.
            </Text>
          </View>
          {errors.terms && (
            <Text style={styles.errorMessage}>{errors.terms}</Text>
          )}

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
  label: {
    marginTop: 20,
    marginBottom: 10,
    fontWeight: "bold",
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
  picker: {
    height: 50,
    width: "100%",
    backgroundColor: "#fff",
    borderColor: "#6C6A6A",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 20,
    width: "100%",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#6C6A6A",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#000",
    flexShrink: 1,
    maxWidth: "85%",
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

export default DriverTemp;

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
import {
  getAllDrivers,
  getDriverById,
  updateDriver,
} from "../../service/DriverService";
import axios from "axios";

const UpdateDriverInfo = ({ navigation, route }) => {
  const { token, driverId } = route.params;
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [isChecked, setIsChecked] = useState(false);

  // State to track error messages
  const [errors, setErrors] = useState({});

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
  // Fetch driver details by ID on component mount
  useEffect(() => {
    const fetchDriverDetails = async () => {
      try {
        const driverData = await getDriverById(driverId);
        setEmail(driverData.personalInfo.email || "");
        setPhoneNumber(driverData.personalInfo.phoneNumber || "");
        setSelectedCity(driverData.personalInfo.city || "");
        setSelectedGender(driverData.personalInfo.gender || "");
      } catch (error) {
        Alert.alert("Error", "Failed to load driver information.");
        console.error("Error fetching driver details:", error.message);
      }
    };

    fetchDriverDetails();
  }, [driverId]);

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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email regex validation

    // Validate email
    if (!email) {
      newErrors.email = "Email không được để trống.";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Vui lòng nhập email hợp lệ.";
    }

    // Validate phone number
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
        const existingDrivers = await getAllDrivers();
        const phoneExists = existingDrivers.some(
          (driver) =>
            driver.personalInfo.phoneNumber === phoneNumber &&
            driver._id !== driverId
        );

        if (phoneExists) {
          newErrors.phoneNumber = "Số điện thoại này đã tồn tại.";
        }
      } catch (e) {
        Alert.alert(
          "Lỗi",
          "Không thể kiểm tra số điện thoại đã tồn tại. Vui lòng thử lại."
        );
        console.error("Failed to check existing phone number:", e);
      }
    }

    // Validate city
    if (!selectedCity) {
      newErrors.city = "Vui lòng chọn thành phố.";
    }

    // Validate gender
    if (!selectedGender) {
      newErrors.gender = "Vui lòng chọn giới tính.";
    }

    setErrors(newErrors);

    // If no errors, proceed to save information
    if (Object.keys(newErrors).length === 0) {
      try {
        const updatedInfo = {
          email,
          phoneNumber,
          city: selectedCity,
          gender: selectedGender,
        };

        await updateDriver(driverId, updatedInfo, token);

        // Lưu thông tin thành công
        Alert.alert("Thành công", "Cập nhật thông tin cá nhân thành công!");
        navigation.navigate("DriverProfile");
      } catch (e) {
        Alert.alert(
          "Lỗi",
          "Không thể cập nhật thông tin. Vui lòng thử lại sau."
        );
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
          onPress={() => navigation.navigate("DriverProfile")}
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
          <Text style={styles.headerText}>Cập nhập thông tin cá nhân</Text>
          <Text style={styles.subHeaderText}>
            Cung cấp thông tin cần cập nhập
          </Text>

          <View style={styles.inputContainer}>
            {/* Họ Input */}
            <TextInput
              placeholder="Email *"
              style={styles.input}
              onChangeText={setEmail}
              value={email}
              keyboardType="default"
              autoCapitalize="words"
              placeholderTextColor="#6D6A6A"
            />
            {errors.email && (
              <Text style={styles.errorMessage}>{errors.email}</Text>
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

          <TouchableOpacity style={styles.button} onPress={handleContinue}>
            <Text style={styles.buttonText}>Cập nhập</Text>
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

export default UpdateDriverInfo;

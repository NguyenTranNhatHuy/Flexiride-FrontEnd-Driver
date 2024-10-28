import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const PersonalInformation = ({ navigation }) => {
  const [avatarCompleted, setAvatarCompleted] = useState(false);
  const [passportCompleted, setPassportCompleted] = useState(false);
  const [driverLicenseCompleted, setDriverLicenseCompleted] = useState(false);
  const [criminalRecordCompleted, setCriminalRecordCompleted] = useState(false);
  const [addressCompleted, setAddressCompleted] = useState(false);
  const [emergencyContactCompleted, setEmergencyContactCompleted] =
    useState(false);
  const [bankAccountCompleted, setBankAccountCompleted] = useState(false);
  const [commitCompleted, setCommitCompleted] = useState(false);

  // Function to check avatar and other items status from local storage
  const checkStatus = async () => {
    try {
      const storedPersonalInfo = await AsyncStorage.getItem("personalInfo");
      if (storedPersonalInfo) {
        const parsedInfo = JSON.parse(storedPersonalInfo);
        setAvatarCompleted(!!parsedInfo.avatar);
      } else {
        setAvatarCompleted(false);
      }

      const passport = await AsyncStorage.getItem("passport");
      setPassportCompleted(!!passport);

      const driverLicense = await AsyncStorage.getItem("driverLicense");
      setDriverLicenseCompleted(!!driverLicense);

      const criminalRecord = await AsyncStorage.getItem("criminalRecord");
      setCriminalRecordCompleted(!!criminalRecord);

      const addressRecord = await AsyncStorage.getItem("address");
      setAddressCompleted(!!addressRecord);

      const emergencyContactRecord = await AsyncStorage.getItem(
        "emergencyContact"
      );
      setEmergencyContactCompleted(!!emergencyContactRecord);

      const bankAccountRecord = await AsyncStorage.getItem("bankAccount");
      setBankAccountCompleted(!!bankAccountRecord);

      const commitedRecord = await AsyncStorage.getItem("committed");
      setCommitCompleted(!!commitedRecord);
    } catch (error) {
      console.error("Error retrieving status:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkStatus();
    }, [])
  );

  const handleContinue = async  () => {
    if (
      avatarCompleted &&
      passportCompleted &&
      driverLicenseCompleted &&
      criminalRecordCompleted &&
      addressCompleted &&
      emergencyContactCompleted &&
      bankAccountCompleted &&
      commitCompleted
    ) {
      const storedPersonalInfo = await AsyncStorage.getItem("personalInfo");
      const parsedInfo = JSON.parse(storedPersonalInfo);
      console.log("personal info", parsedInfo);
      navigation.navigate("VehicleInformation");
    } else {
      Alert.alert(
        "Thông báo",
        "Bạn cần hoàn thành tất cả thông tin trước khi tiếp tục."
      );
    }
  };

  const handleNavigation = (item) => {
    switch (item) {
      case "Ảnh Chân Dung":
        navigation.navigate("PortraitPhoto");
        break;
      case "CCCD/Hộ Chiếu":
        navigation.navigate("Passport");
        break;
      case "Bằng Lái Xe":
        navigation.navigate("License");
        break;
      case "Hồ Sơ Lý Lịch Tư Pháp":
        navigation.navigate("JudicialBackground");
        break;
      case "Thông Tin Liên Hệ Khẩn Cấp Và Địa Chỉ Tạm Trú":
        navigation.navigate("EmergencyContact");
        break;
      case "Tài Khoản Ngân Hàng":
        navigation.navigate("BankAccountNumber");
        break;
      case "Cam Kết":
        navigation.navigate("Commitment");
        break;
      default:
        break;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "android" ? "height" : null}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-left" size={20} color="black" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.headerText}>Thông tin cá nhân</Text>

        {[
          "Ảnh Chân Dung",
          "CCCD/Hộ Chiếu",
          "Bằng Lái Xe",
          "Hồ Sơ Lý Lịch Tư Pháp",
          "Thông Tin Liên Hệ Khẩn Cấp Và Địa Chỉ Tạm Trú",
          "Tài Khoản Ngân Hàng",
          "Cam Kết",
        ].map((item, index) => (
          <View style={styles.itemContainer} key={index}>
            <Text style={styles.itemText}>
              {index + 1}/ {item}
            </Text>
            <TouchableOpacity
              style={styles.requiredButton}
              onPress={() => handleNavigation(item)}
            >
              <Text
                style={[
                  styles.requiredButtonText,
                  (item === "Ảnh Chân Dung" && avatarCompleted) ||
                  (item === "CCCD/Hộ Chiếu" && passportCompleted) ||
                  (item === "Bằng Lái Xe" && driverLicenseCompleted) ||
                  (item === "Hồ Sơ Lý Lịch Tư Pháp" &&
                    criminalRecordCompleted) ||
                  (item === "Thông Tin Liên Hệ Khẩn Cấp Và Địa Chỉ Tạm Trú" &&
                    emergencyContactCompleted) ||
                  (item === "Địa Chỉ" && addressCompleted) ||
                  (item === "Tài Khoản Ngân Hàng" && bankAccountCompleted) ||
                  (item === "Cam Kết" && commitCompleted)
                    ? { color: "green" }
                    : { color: "red" },
                ]}
              >
                {(item === "Ảnh Chân Dung" && avatarCompleted) ||
                (item === "CCCD/Hộ Chiếu" && passportCompleted) ||
                (item === "Bằng Lái Xe" && driverLicenseCompleted) ||
                (item === "Hồ Sơ Lý Lịch Tư Pháp" && criminalRecordCompleted) ||
                (item === "Thông Tin Liên Hệ Khẩn Cấp Và Địa Chỉ Tạm Trú" &&
                  emergencyContactCompleted) ||
                (item === "Địa Chỉ" && addressCompleted) ||
                (item === "Tài Khoản Ngân Hàng" && bankAccountCompleted) ||
                (item === "Cam Kết" && commitCompleted)
                  ? "Hoàn thành"
                  : "Bắt buộc"}
              </Text>
              <Icon
                name="chevron-right"
                size={14}
                color="#000"
                style={styles.icon}
              />
            </TouchableOpacity>
          </View>
        ))}

        {/* Continue button */}
        <TouchableOpacity onPress={handleContinue} style={styles.button}>
          <Text style={styles.buttonText}>Tiếp tục</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Style definitions remain unchanged
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFC323",
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 20,
    marginTop: 20,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  itemText: {
    fontSize: 16,
    color: "#000",
    flex: 1,
    fontWeight: "bold",
  },
  requiredButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  requiredButtonText: {
    fontSize: 14,
    marginRight: 5,
  },
  button: {
    backgroundColor: "#270C6D",
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 30,
    alignSelf: "flex-end",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
    marginTop: 10,
  },
});

export default PersonalInformation;

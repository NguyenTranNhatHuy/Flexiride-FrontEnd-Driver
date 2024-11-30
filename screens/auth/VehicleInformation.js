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
import { registerDriver } from "../../service/AuthDriverService"; // Đảm bảo rằng đường dẫn đúng
const VehicleInformation = ({ navigation }) => {
  const [carImageCompleted, setCarImageCompleted] = useState(false);
  const [carInsuranceCompleted, setCarInsuranceCompleted] = useState(false);
  const [vehicleRegistrationCompleted, setvehicleRegistrationCompleted] =
    useState(false);

  // Function to check status from local storage
  const checkStatus = async () => {
    try {
      const carImage = await AsyncStorage.getItem("vehicleImages");
      setCarImageCompleted(!!carImage);

      const carInsurance = await AsyncStorage.getItem("vehicleInsurance");
      setCarInsuranceCompleted(!!carInsurance);

      const vehicleRegistration = await AsyncStorage.getItem(
        "vehicleRegistration"
      );
      setvehicleRegistrationCompleted(!!vehicleRegistration);
    } catch (error) {
      console.error("Error retrieving status:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkStatus();
    }, [])
  );

  const handleContinue = async () => {
    if (
      carImageCompleted &&
      carInsuranceCompleted &&
      vehicleRegistrationCompleted
    ) {
      const storedPersonalInfo = await AsyncStorage.getItem("personalInfo");
      const parsedInfo = JSON.parse(storedPersonalInfo);

      const storedAddress = await AsyncStorage.getItem("address");
      const parsedAddress = JSON.parse(storedAddress);

      const storedEmergencyContact = await AsyncStorage.getItem(
        "emergencyContact"
      );
      const parsedEmergencyContact = JSON.parse(storedEmergencyContact);

      const storedPassport = await AsyncStorage.getItem("passport");
      const parsedPassport = JSON.parse(storedPassport);

      const storedDriverLicense = await AsyncStorage.getItem("driverLicense");
      const parsedDriverLicense = JSON.parse(storedDriverLicense);

      const storedCriminalRecord = await AsyncStorage.getItem("criminalRecord");
      const parsedCriminalRecord = JSON.parse(storedCriminalRecord);

      const storedVehicleRegistration = await AsyncStorage.getItem(
        "vehicleRegistration"
      );
      const parsedVehicleRegistration = JSON.parse(storedVehicleRegistration);

      const storedVehicleInsurance = await AsyncStorage.getItem(
        "vehicleInsurance"
      );
      const parsedVehicleInsurance = JSON.parse(storedVehicleInsurance);

      const storedVehicleImages = await AsyncStorage.getItem("vehicleImages");
      const parsedVehicleImages = JSON.parse(storedVehicleImages);

      const storedBankAccount = await AsyncStorage.getItem("bankAccount");
      const parsedBankAccount = JSON.parse(storedBankAccount);

      const storedServiceTypes = await AsyncStorage.getItem("serviceTypes");
      const parsedServiceTypes = JSON.parse(storedServiceTypes);
      const driverData = {
        personalInfo: {
          email: parsedInfo.email,
          password: parsedInfo.password,
          firstName: parsedInfo.firstName,
          lastName: parsedInfo.lastName,
          phoneNumber: parsedInfo.phoneNumber,
          gender: parsedInfo.gender,
          city: parsedInfo.city,
          avatar: parsedInfo.avatar,
          address: parsedAddress,
          emergencyContact: parsedEmergencyContact,
        },
        document: {
          passport: parsedPassport,
          driverLicense: parsedDriverLicense,
          criminalRecord: parsedCriminalRecord,
          vehicleRegistration: parsedVehicleRegistration,
          vehicleInsurance: parsedVehicleInsurance,
        },
        serviceTypes: parsedServiceTypes,
        vehicleImages: parsedVehicleImages,
        bankAccount: parsedBankAccount,
        role: "booking",
      };

      try {
        const response = await registerDriver(driverData);
        console.log("Driver registered successfully:", response);
        await AsyncStorage.clear();
        navigation.navigate("ProfileApproval");
      } catch (error) {
        console.error("Registration failed:", error);
      }
    } else {
      Alert.alert(
        "Thông báo",
        "Bạn cần hoàn thành tất cả thông tin trước khi tiếp tục."
      );
    }
  };

  const handleNavigation = (item) => {
    switch (item) {
      case "Hình Xe":
        navigation.navigate("CarImage");
        break;
      case "Giấy Đăng Ký Xe":
        navigation.navigate("VehicleRegistration");
        break;
      case "Bảo Hiểm Xe":
        navigation.navigate("CarInsurance");
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
        <Text style={styles.headerText}>Thông tin xe</Text>

        {[
          { name: "Hình Xe", completed: carImageCompleted },
          { name: "Giấy Đăng Ký Xe", completed: vehicleRegistrationCompleted },
          { name: "Bảo Hiểm Xe", completed: carInsuranceCompleted },
        ].map((item, index) => (
          <View style={styles.itemContainer} key={index}>
            <Text style={styles.itemText}>
              {index + 1}/ {item.name}
            </Text>
            <TouchableOpacity
              style={styles.requiredButton}
              onPress={() => handleNavigation(item.name)}
            >
              <Text
                style={[
                  styles.requiredButtonText,
                  item.completed ? { color: "green" } : { color: "red" },
                ]}
              >
                {item.completed ? "Hoàn thành" : "Bắt buộc"}
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

export default VehicleInformation;

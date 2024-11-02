import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/FontAwesome"; // Thêm thư viện icon
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const SubscriptionService = ({ navigation }) => {
  const [selectedService, setSelectedService] = useState("");

  const handleContinue = async () => {
    if (!selectedService) {
      alert("Vui lòng chọn dịch vụ để tiếp tục.");
      return;
    }

    // Save the selected service to local storage
    try {
      const storedPersonalInfo = await AsyncStorage.getItem("personalInfo");
      if (storedPersonalInfo) {
        const parsedInfo = JSON.parse(storedPersonalInfo);
        parsedInfo.serviceType = selectedService; // Add serviceType to the object
        await AsyncStorage.setItem("personalInfo", JSON.stringify(parsedInfo)); // Save back to local storage
      }
    } catch (error) {
      console.log("Error saving service type:", error);
    }

    console.log("Dịch vụ đã chọn:", selectedService);
    navigation.navigate("Info");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "android" ? "height" : null}
    >
      {/* Nút Back */}
      <TouchableOpacity style={styles.backButton}>
        <Icon
          onPress={() => navigation.navigate("DriverTemp")} // Navigate back without using route
          name="arrow-left"
          size={20}
          color="black"
        />
      </TouchableOpacity>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>Chọn dịch vụ muốn đăng ký</Text>

        <View style={styles.pickerContainer}>
          <Picker
            style={styles.picker}
            selectedValue={selectedService}
            onValueChange={(itemValue) => setSelectedService(itemValue)}
          >
            <Picker.Item label="Chọn dịch vụ" value="" />
            <Picker.Item label="Ô tô" value="Ô tô" />
            <Picker.Item label="Xe máy" value="Xe máy" />
            <Picker.Item label="Thuê tài xế" value="Thuê tài xế" />
            <Picker.Item label="Ghép chuyến xe" value="Ghép chuyến xe" />
          </Picker>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Tiếp tục</Text>
        </TouchableOpacity>
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

  label: {
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
  },

  scrollContainer: {
    paddingHorizontal: 20,
  },

  pickerContainer: {
    width: "80%",
    alignSelf: "center",
    justifyContent: "center",
    marginTop: 50,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 5,
    borderWidth: 1,
    borderColor: "#C4C4C4",
  },

  picker: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#C4C4C4",
  },

  button: {
    backgroundColor: "#270C6D",
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 300,
    alignSelf: "flex-end",
  },

  buttonText: {
    color: "white",
    fontSize: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    zIndex: 10,
  },
});

export default SubscriptionService;

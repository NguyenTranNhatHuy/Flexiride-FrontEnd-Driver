import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Checkbox from "expo-checkbox"; // Ensure you install expo-checkbox

const services = {
  "6740cad2f46eafcdef873b2d": "Xe máy",
  "6740cbccf46eafcdef873b3e": "Xe ô tô 4 chỗ",
  "6740cbe5f46eafcdef873b41": "Xe ô tô 7 chỗ",
};

const subOptions = {
  "6740cad2f46eafcdef873b2d": [
    { id: "67414d2114fada16bde3ada1", label: "Đặt xe máy" },
    { id: "67414d3514fada16bde3ada4", label: "Thuê tài xế xe máy" },
  ],
  "6740cbccf46eafcdef873b3e": [
    { id: "6740cbccf46eafcdef873b3e", label: "Đặt xe ô tô 4 chỗ" },
    { id: "67414d3514fada16bde3ada4", label: "Thuê tài xế ô tô" },
    { id: "67414fb314fada16bde3ada7", label: "Xe ghép 4 chỗ" },
  ],
  "6740cbe5f46eafcdef873b41": [
    { id: "6740cbe5f46eafcdef873b41", label: "Đặt xe ô tô 7 chỗ" },
    { id: "67414d3514fada16bde3ada4", label: "Thuê tài xế ô tô" },
    { id: "67414fbd14fada16bde3adaa", label: "Xe ghép 7 chỗ" },
    { id: "67414fe614fada16bde3adad", label: "Xe ghép limousine" },
  ],
};

const SubscriptionService = ({ navigation }) => {
  const [selectedService, setSelectedService] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSubOptions, setSelectedSubOptions] = useState([]);
  const [serviceName, setServiceName] = useState("");
  const [subOptionNames, setSubOptionNames] = useState([]);

  useEffect(() => {
    // Retrieve selected sub-options from AsyncStorage when the component mounts
    const loadSelectedOptions = async () => {
      try {
        const storedServiceTypes = await AsyncStorage.getItem("serviceTypes");
        if (storedServiceTypes) {
          const parsedServiceTypes = JSON.parse(storedServiceTypes);
          setSelectedSubOptions(parsedServiceTypes.serviceTypes || []);
          console.log("GType", parsedServiceTypes);
        }
      } catch (error) {
        console.log("Error loading selected options:", error);
      }
    };

    loadSelectedOptions();
  }, []);

  const toggleCheckbox = (id) => {
    setSelectedSubOptions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleContinue = async () => {
    if (selectedSubOptions.length === 0) {
      alert("Vui lòng chọn ít nhất một tùy chọn để tiếp tục.");
      return;
    }

    // Set the service name and sub-option names to display
    setServiceName(services[selectedService]);
    setSubOptionNames(
      selectedSubOptions.map(
        (id) =>
          subOptions[selectedService].find((subOption) => subOption.id === id)
            ?.label
      )
    );
    setModalVisible(false);

    // Save selected sub-options to AsyncStorage
    try {
      await AsyncStorage.setItem(
        "serviceTypes", // Key used to store the selected sub-options
        JSON.stringify(selectedSubOptions)
      );
    } catch (error) {
      console.log("Error saving service types:", error);
    }
    const storedServiceTypes = await AsyncStorage.getItem("serviceTypes");
    console.log("Stored serviceTypes:", storedServiceTypes);
    // console.log("Tùy chọn đã chọn:", selectedSubOptions);
    navigation.navigate("Info");
  };

  const handleSubService = () => {
    if (selectedSubOptions.length === 0) {
      alert("Vui lòng chọn ít nhất một tùy chọn để tiếp tục.");
      return;
    }
    // Set the service name and sub-option names to display
    setServiceName(services[selectedService]);
    setSubOptionNames(
      selectedSubOptions.map(
        (id) =>
          subOptions[selectedService].find((subOption) => subOption.id === id)
            ?.label
      )
    );
    setModalVisible(false);
  };

  const getSubOptions = () => {
    return subOptions[selectedService] || [];
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "android" ? "height" : null}
    >
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton}>
        <Icon
          onPress={() => navigation.navigate("DriverTemp")}
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
            onValueChange={(itemValue) => {
              setSelectedService(itemValue);
              setSelectedSubOptions([]); // Reset selected sub-options
              setModalVisible(itemValue ? true : false); // Open modal if a service is selected
            }}
          >
            <Picker.Item label="Chọn dịch vụ" value="" />
            <Picker.Item label="Xe máy" value="6740cad2f46eafcdef873b2d" />
            <Picker.Item
              label="Xe ô tô 4 chỗ"
              value="6740cbccf46eafcdef873b3e"
            />
            <Picker.Item
              label="Xe ô tô 7 chỗ"
              value="6740cbe5f46eafcdef873b41"
            />
          </Picker>
        </View>

        {/* Modal for sub-options */}
        <Modal animationType="slide" transparent={true} visible={modalVisible}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {getSubOptions().map((subOption) => (
                <View key={subOption.id} style={styles.checkboxContainer}>
                  <Checkbox
                    value={selectedSubOptions.includes(subOption.id)}
                    onValueChange={() => toggleCheckbox(subOption.id)}
                    color="#270C6D"
                  />
                  <Text style={styles.checkboxLabel}>{subOption.label}</Text>
                </View>
              ))}
              <TouchableOpacity
                style={styles.button1}
                onPress={handleSubService} // Close the modal
              >
                <Text style={styles.buttonText}>Xong</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Display selected service and options */}
        {serviceName && (
          <View style={styles.selectedServiceContainer}>
            <Text style={styles.selectedServiceText}>
              Dịch vụ đã chọn: {serviceName}
            </Text>
            {subOptionNames.map((option, index) => (
              <Text key={index} style={styles.selectedServiceText}>
                + {option}.
              </Text>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Tiếp tục</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFC323", paddingTop: 30 },
  label: {
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
  },
  scrollContainer: { paddingHorizontal: 20 },
  pickerContainer: {
    width: "80%",
    alignSelf: "center",
    justifyContent: "center",
    marginTop: 50,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 5,
  },
  picker: { width: "100%", height: 50 },
  button: {
    backgroundColor: "#270C6D",
    padding: 10,
    borderRadius: 20,
    alignSelf: "center",
    marginTop: 20,
    marginLeft: 260,
  },
  button1: {
    backgroundColor: "#270C6D",
    padding: 10,
    borderRadius: 20,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 200,
  },
  buttonText: { color: "white", fontWeight: "bold", textAlign: "center" },
  selectedServiceContainer: {
    marginTop: 10,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginLeft: 37,
    marginRight: 37,
  },
  selectedServiceText: { fontSize: 16, color: "#000" },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  checkboxLabel: { fontSize: 18, marginLeft: 10 },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  backButton: { position: "absolute", left: 10, top: 30 },
});

export default SubscriptionService;

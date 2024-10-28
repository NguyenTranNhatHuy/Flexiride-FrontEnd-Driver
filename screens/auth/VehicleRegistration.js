import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/FontAwesome";
import { uploadImageToCloudinary } from "../../utils/CloudinaryConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

const VehicleRegistration = ({ navigation }) => {
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [licensePlate, setLicensePlate] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchVehicleRegistrationData = async () => {
      try {
        const data = await AsyncStorage.getItem("vehicleRegistration");
        if (data) {
          const { frontImage, backImage, licensePlate, fuelType } = JSON.parse(data);
          setFrontImage(frontImage || null);
          setBackImage(backImage || null);
          setLicensePlate(licensePlate || "");
          setFuelType(fuelType || "");
        }
      } catch (error) {
        console.error("Error fetching vehicleRegistration data:", error);
      }
    };

    fetchVehicleRegistrationData();
  }, []);

  const pickImage = async (setImage) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Bạn cần cho phép quyền truy cập thư viện ảnh để tải ảnh lên!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async (setImage) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Bạn cần cho phép quyền truy cập camera để chụp ảnh!");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const validateInputs = () => {
    let valid = true;
    let newErrors = {};

    if (!licensePlate || !/^[a-zA-Z0-9]{1,10}$/.test(licensePlate)) {
      newErrors.licensePlate = "Biển số xe phải chứa chữ và số, dưới 10 ký tự";
      valid = false;
    }

    if (!fuelType) {
      newErrors.fuelType = "Loại nhiên liệu không được để trống";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSave = async () => {
    if (!frontImage || !backImage) {
      Alert.alert("Thông báo","Bạn cần tải lên cả hai mặt trước và sau của giấy đăng ký xe");
      return;
    }

    if (!validateInputs()) {
      return;
    }

    try {
      setUploading(true);
      const frontImageUrl = await uploadImageToCloudinary(frontImage);
      const backImageUrl = await uploadImageToCloudinary(backImage);

      const vehicleRegistrationData = {
        frontImage: frontImageUrl,
        backImage: backImageUrl,
        licensePlate,
        fuelType,
      };

      await AsyncStorage.setItem("vehicleRegistration", JSON.stringify(vehicleRegistrationData));
      setUploading(false);
      navigation.navigate("VehicleInformation");
    } catch (error) {
      console.error("Error uploading images:", error);
      setUploading(false);
      Alert.alert("Đã có lỗi xảy ra khi tải ảnh lên.");
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "android" ? "height" : null}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("VehicleInformation")}>
        <Icon name="arrow-left" size={20} color="black" />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerText}>Tải lên giấy đăng ký xe</Text>

        <Text style={styles.labelText}>Mặt Trước (Bắt buộc)</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={() => pickImage(setFrontImage)}>
          {frontImage ? (
            <Image source={{ uri: frontImage }} style={styles.fullImage} resizeMode="contain" />
          ) : (
            <>
              <Image source={require("../../assets/camera.png")} style={styles.icon} />
              <Text style={styles.uploadText}>Tải ảnh lên</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.cameraButton} onPress={() => takePhoto(setFrontImage)}>
          <Text style={styles.cameraButtonText}>Chụp ảnh mặt trước</Text>
        </TouchableOpacity>

        <Text style={styles.labelText}>Mặt Sau (Bắt buộc)</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={() => pickImage(setBackImage)}>
          {backImage ? (
            <Image source={{ uri: backImage }} style={styles.fullImage} resizeMode="contain" />
          ) : (
            <>
              <Image source={require("../../assets/camera.png")} style={styles.icon} />
              <Text style={styles.uploadText}>Tải ảnh lên</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.cameraButton} onPress={() => takePhoto(setBackImage)}>
          <Text style={styles.cameraButtonText}>Chụp ảnh mặt sau</Text>
        </TouchableOpacity>

        <Text style={styles.labelText}>Biển số xe *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập biển số xe"
          value={licensePlate}
          onChangeText={setLicensePlate}
        />
        {errors.licensePlate && <Text style={styles.errorText}>{errors.licensePlate}</Text>}

        <Text style={styles.labelText}>Loại nhiên liệu *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập loại nhiên liệu"
          value={fuelType}
          onChangeText={setFuelType}
        />
        {errors.fuelType && <Text style={styles.errorText}>{errors.fuelType}</Text>}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={uploading}>
          <Text style={styles.saveButtonText}>
            {uploading ? <ActivityIndicator color="#FFF" /> : "Lưu"}
          </Text>
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
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  labelText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  uploadButton: {
    backgroundColor: "#D9D9D9",
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 20,
  },
  cameraButton: {
    backgroundColor: "#270C6D",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  cameraButtonText: {
    color: "white",
    fontSize: 16,
  },
  icon: {
    width: 40,
    height: 40,
    marginBottom: 10,
  },
  uploadText: {
    color: "#6A6A6A",
    fontSize: 16,
  },
  fullImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  input: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
    color: "#000",
    borderWidth: 1,
    borderColor: "black",
    elevation: 5,
  },
  errorText: {
    color: "red",
    marginTop: -15,
    marginBottom: 10,
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: "#270C6D",
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 260,
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 10,
    padding: 10,
    zIndex: 1,
  },
});

export default VehicleRegistration;

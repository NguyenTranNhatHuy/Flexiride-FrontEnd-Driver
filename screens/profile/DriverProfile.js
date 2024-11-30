import React, { useState, useCallback } from "react";

import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAuth } from "../../provider/AuthProvider";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker"; // Import ImagePicker from expo
import { uploadImageToCloudinary } from "../../utils/CloudinaryConfig";
import { updateDriver } from "../../service/DriverService";
const DriverProfile = ({ route }) => {
  const { authState, logout } = useAuth();
  const [personalInfo, setPersonalInfo] = useState({});
  const [address, setAddress] = useState({});
  const [bank, setBank] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false); // Manage modal visibility
  const navigation = useNavigation();

  const refreshData = () => {
    setPersonalInfo(authState.user.personalInfo);
    setAddress(authState.user.personalInfo.address);
    setBank(authState.user.bankAccount);
  };

  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đồng ý",
          onPress: async () => {
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Function to request permission to access the media library
  const requestLibraryPermission = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.granted) {
      pickImage();
    } else {
      alert("Permission to access media library is required.");
    }
  };

  // Function to request permission to access the camera
  const requestCameraPermission = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.granted) {
      takePhoto();
    } else {
      alert("Permission to access camera is required.");
    }
  };

  // Function to open image picker
  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Quyền truy cập", "Quyền truy cập thư viện ảnh bị từ chối.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setModalVisible(false);
      const uploadedAvatarUrl = await uploadImageToCloudinary(
        result.assets[0].uri
      ); // Using the image from the result
      const updatedInfo = {
        avatar: uploadedAvatarUrl,
      };
      await updateDriver(authState.userId, updatedInfo, authState.token);
      console.log("url ảnh", uploadedAvatarUrl);
    }
  };

  // Function to open the camera
  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Quyền truy cập", "Quyền truy cập camera bị từ chối.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setModalVisible(false);
      const uploadedAvatarUrl = await uploadImageToCloudinary(
        result.assets[0].uri
      ); // Using the image from the result
      const updatedInfo = {
        avatar: uploadedAvatarUrl,
      };
      await updateDriver(authState.userId, updatedInfo, authState.token);
      console.log("url ảnh", uploadedAvatarUrl);
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
        <View style={styles.header}>
          <Icon name="arrow-left" size={24} color="#fff" />
          <Text style={styles.headerText}>Thông tin cá nhân</Text>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{
                uri:
                  selectedImage ||
                  personalInfo.avatar ||
                  "https://via.placeholder.com/150",
              }}
              style={styles.profileImage}
            />
            <TouchableOpacity
              style={styles.cameraIcon}
              onPress={() => setModalVisible(true)} // Show modal when clicked
            >
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>
            {personalInfo.firstName} {personalInfo.lastName}
          </Text>
        </View>

        <View style={styles.personalInfoSection}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("UpdateDriverInfo", {
                token: authState.token,
                driverId: authState.userId,
                personalInfo,
                address,
                bank,
              })
            }
            style={styles.editButton}
          >
            <Text style={styles.editButtonText}>Cập nhập</Text>
          </TouchableOpacity>

          <View style={styles.infoItem}>
            <Ionicons name="mail-outline" size={20} color="#333" />
            <Text style={styles.infoText}>{personalInfo.email}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="call-outline" size={20} color="#333" />
            <Text style={styles.infoText}>{personalInfo.phoneNumber}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={20} color="#333" />
            <Text style={styles.infoText}>{personalInfo.city}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="transgender-outline" size={20} color="#333" />
            <Text style={styles.infoText}>{personalInfo.gender}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="card-outline" size={20} color="#333" />
            <Text style={styles.infoText}>
              {bank.bankName} {" - "}
              {bank.accountNumber}
            </Text>
          </View>
        </View>

        <View style={styles.utilitiesSection}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ChangePassword", {
                token: authState.token,
                driverId: authState.userId,
              })
            }
            style={styles.utilityItem}
          >
            <Ionicons name="lock-closed-outline" size={20} color="#007BFF" />
            <Text style={styles.utilityText}>Đổi mật khẩu</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.utilityItem}>
            <Ionicons name="download-outline" size={20} color="#007BFF" />
            <Text style={styles.utilityText}>Downloads</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.utilityItem}>
            <Ionicons name="help-circle-outline" size={20} color="#007BFF" />
            <Text style={styles.utilityText}>Trợ giúp</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.lastUtilityItem}
          >
            <Ionicons name="log-out-outline" size={20} color="#007BFF" />
            <Text style={styles.utilityText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal for image selection */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContainer}>
              <TouchableOpacity
                style={styles.closeIcon}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={30} color="#000" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Chọn ảnh</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.leftButton]}
                  onPress={requestCameraPermission} // Request camera permission
                >
                  <Text style={styles.buttonText}>Mở Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.rightButton]}
                  onPress={requestLibraryPermission} // Request library permission
                >
                  <Text style={styles.buttonText}>Chọn ảnh từ Thư viện</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFC323",
  },
  headerText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
  profileSection: {
    alignItems: "center",
    marginTop: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  profileImageContainer: {
    position: "relative",
    borderRadius: 55,
    borderWidth: 2,
    borderColor: "#FFC323",
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FFC323",
    borderRadius: 50,
    padding: 6,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "600",
    marginTop: 10,
    color: "#333",
  },
  personalInfoSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  editButton: {
    position: "absolute",
    right: 16,
    top: 0,
  },
  editButtonText: {
    color: "#007BFF",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  infoText: {
    marginLeft: 16,
    fontSize: 16,
    color: "#333",
  },
  utilitiesSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  utilityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  utilityText: {
    marginLeft: 16,
    fontSize: 16,
    color: "#007BFF",
  },
  lastUtilityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  //modal
  modalContainer: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative", // Allows absolute positioning for the close icon
    marginTop: 80,
    marginBottom: 80,
  },

  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },

  closeIcon: {
    position: "absolute",
    top: 10,
    right: 10,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },

  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },

  button: {
    backgroundColor: "#FFC323",
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    marginHorizontal: 8,
  },

  buttonText: {
    color: "#000",
    fontSize: 16,
    textAlign: "center",
  },

  leftButton: {
    marginRight: 4, // Space between the buttons
  },

  rightButton: {
    marginLeft: 4, // Space between the buttons
  },
});

export default DriverProfile;

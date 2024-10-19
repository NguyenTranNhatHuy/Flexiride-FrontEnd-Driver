import React, { useState } from "react";
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
} from "react-native";
import * as ImagePicker from "expo-image-picker"; // Sử dụng ImagePicker để chọn ảnh
import Icon from "react-native-vector-icons/FontAwesome"; // Thêm thư viện icon

const CarInsurance = ({route, navigation}) => {
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);

  // Function to handle image picking
  const pickImage = async (setImage) => {
    // Hỏi quyền truy cập thư viện ảnh
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Bạn cần cho phép quyền truy cập thư viện ảnh để tải ảnh lên!");
      return;
    }

    // Mở thư viện ảnh để chọn
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Cho phép chỉnh sửa ảnh
      aspect: [4, 3], // Đặt tỉ lệ khung hình
      quality: 1, // Chất lượng ảnh (từ 0 đến 1)
    });

    // Nếu người dùng không hủy chọn ảnh thì lưu URI vào state
    if (!result.canceled) {
      setImage(result.uri); // Lưu URI ảnh đã chọn
    }
  };
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "android" ? "height" : null}
    >
      {/* Nút Back */}
      <TouchableOpacity style={styles.backButton}>
        <Icon
          onPress={() =>
            navigation.navigate("VehicleInformation", {
              // PortraitCompleted: route.params.PortraitCompleted,
            })
          }
          name="arrow-left"
          size={20}
          color="black"
        />
      </TouchableOpacity>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.headerText}>Tải lên bảo hiểm xe</Text>

        {/* Front Image Upload */}
        <Text style={styles.labelText}>Mặt Trước (Bắt buộc)</Text>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => pickImage(setFrontImage)}
        >
          {frontImage ? (
            <Image source={{ uri: frontImage }} style={styles.image} />
          ) : (
            <>
              <Image
                source={require("../../assets/camera.png")}
                style={styles.icon}
              />
              <Text style={styles.uploadText}>Tải ảnh lên</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Back Image Upload */}
        <Text style={styles.labelText}>Mặt Sau (Bắt buộc)</Text>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => pickImage(setBackImage)}
        >
          {backImage ? (
            <Image source={{ uri: backImage }} style={styles.image} />
          ) : (
            <>
              <Image
                source={require("../../assets/camera.png")}
                style={styles.icon}
              />
              <Text style={styles.uploadText}>Tải ảnh lên</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Lưu</Text>
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
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 20,
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
  image: {
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
    borderWidth: 1, // Độ rộng của viền
    borderColor: "black", // Màu viền
    elevation: 5, // Đổ bóng dành cho Android
  },
  saveButton: {
    backgroundColor: "#270C6D",
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "center",
    marginLeft: 260,
    marginTop: 20,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
    padding: 10,
    marginTop: 10,
  },
});

export default CarInsurance;

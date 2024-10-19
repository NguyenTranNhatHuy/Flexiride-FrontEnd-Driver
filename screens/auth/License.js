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
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/FontAwesome";
import { uploadImageToCloudinary } from "../utils/CloudinaryConfig"; // Adjust the import path as necessary

const License = ({ route, navigation }) => {
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dateIssued, setDateIssued] = useState(new Date());

  // Function to handle image picking
  const pickImage = async (setImage) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Bạn cần cho phép quyền truy cập thư viện ảnh để tải ảnh lên!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri); // Set the selected image URI
    }
  };

  // Function to handle saving data
  const handleSave = async () => {
    if (!frontImage || !backImage) {
      alert("Bạn cần tải lên cả hai mặt trước và sau của bằng lái xe.");
      return;
    }

    try {
      setUploading(true);
      // Upload front image
      const frontImageUrl = await uploadImageToCloudinary(frontImage);
      // Upload back image
      const backImageUrl = await uploadImageToCloudinary(backImage);

      // Simulate the saving process and navigation
      setTimeout(() => {
        setUploading(false);
        navigation.navigate("PersonalInformation", {
          PortraitCompleted: route.params.PortraitCompleted,
          PassportUploaded: true,
          frontImage: frontImageUrl,
          backImage: backImageUrl,
        });
      }, 2000);
    } catch (error) {
      console.error("Error uploading images:", error);
      setUploading(false);
      alert("Đã có lỗi xảy ra khi tải ảnh lên.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "android" ? "height" : null}
    >
      <TouchableOpacity style={styles.backButton}>
        <Icon
          onPress={() =>
            navigation.navigate("PersonalInformation", {
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
        <Text style={styles.headerText}>Tải lên bằng lái xe</Text>

        <Text style={styles.labelText}>Mặt Trước (Bắt buộc)</Text>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => pickImage(setFrontImage)}
        >
          {frontImage ? (
            <Image
              source={{ uri: frontImage }}
              style={styles.fullImage}
              resizeMode="contain"
            />
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

        <Text style={styles.labelText}>Mặt Sau (Bắt buộc)</Text>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => pickImage(setBackImage)}
        >
          {backImage ? (
            <Image
              source={{ uri: backImage }}
              style={styles.fullImage}
              resizeMode="contain"
            />
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

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={uploading}
        >
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
    height: 200,
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
  inputText: {
    color: "#000",
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#270C6D",
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "center",
    marginLeft:260,
    marginTop: 20,
    marginBottom: 20,
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

export default License;

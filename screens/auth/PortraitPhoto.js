import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { uploadImageToCloudinary } from "../..//utils/CloudinaryConfig";

const PortraitPhoto = ({ route }) => {
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");

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
    }
  };

  // Function to handle image upload
  const handleUpload = async () => {
    if (!selectedImage) {
      Alert.alert("Lỗi", "Vui lòng chọn một ảnh trước khi tải lên");
      return;
    }

    setUploading(true);

    try {
      const uploadedAvatarUrl = await uploadImageToCloudinary(selectedImage);
      setAvatarUrl(uploadedAvatarUrl);

      // Navigate to PersonalInformation with avatarUrl and completeFlag
      navigation.navigate("PersonalInformation", {
        avatar: uploadedAvatarUrl,
        PortraitCompleted: true,
      });
    } catch (error) {
      Alert.alert("Lỗi", error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "android" ? "height" : null}
    >
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton}>
        <Icon
          onPress={() => navigation.navigate("PersonalInformation", {})}
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
        <Text style={styles.headerText}>Tải ảnh chân dung lên</Text>

        {/* Upload Button */}
        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.icon} />
          ) : (
            <>
              <Image
                source={require("../../assets/camera.png")}
                style={styles.iconPlaceholder}
              />
              <Text style={styles.uploadText}>Tải ảnh lên</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Requirements */}
        <View style={styles.requirementsContainer}>
          <Text style={styles.requirementsHeader}>Yêu Cầu:</Text>
          <Text style={styles.requirementsText}>
            • Ảnh chụp với phông nền trơn
          </Text>
          <Text style={styles.requirementsText}>
            • Ảnh chụp từ phần thân trên, rõ nét, không chói loá
          </Text>
          <Text style={styles.requirementsText}>
            • Ảnh chụp chính diện nhìn thẳng, không nhắm mắt
          </Text>
          <Text style={styles.requirementsText}>
            • Không sử dụng ảnh thẻ hoặc hình selfie
          </Text>
          <Text style={styles.requirementsText}>
            • Ảnh chụp không đội mũ, không đeo kính râm
          </Text>
          <Text style={styles.requirementsText}>
            • Ảnh chụp không được có thêm người, động vật hoặc các vật khác
            trong khung hình
          </Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleUpload}>
          {uploading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Lưu</Text>
          )}
        </TouchableOpacity>

        {/* Display Avatar */}
        {avatarUrl && (
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarHeader}>Ảnh đại diện:</Text>
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          </View>
        )}
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
  uploadButton: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  icon: {
    width: 150,
    height: 150,
    borderRadius: 75,
    resizeMode: "cover",
    borderWidth: 4,
    borderColor: "#000",
  },
  iconPlaceholder: {
    width: 100,
    height: 100,
    marginBottom: 10,
    borderRadius: 50,
    backgroundColor: "#D9D9D9",
  },
  uploadText: {
    color: "#6A6A6A",
    fontSize: 16,
  },
  requirementsContainer: {
    backgroundColor: "#D9D9D9",
    padding: 20,
    borderRadius: 10,
  },
  requirementsHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  requirementsText: {
    fontSize: 14,
    marginBottom: 5,
  },
  saveButton: {
    backgroundColor: "#270C6D",
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 70,
    marginLeft: 260,
    alignSelf: "center",
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
    marginTop: -20,
    width: 50,
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  avatarHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    resizeMode: "cover",
    borderWidth: 2,
    borderColor: "#000",
  },
});

export default PortraitPhoto;

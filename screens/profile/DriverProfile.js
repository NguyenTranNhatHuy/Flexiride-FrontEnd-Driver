import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAuth } from "../../provider/AuthProvider";
const DriverProfile = () => {
  const { authState } = useAuth();
  useEffect(() => {
    console.log("token  : " + authState.token);
  }, []);
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "android" ? "height" : null}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Kiểm tra giá trị token */}
        <View style={styles.container}>
          <View style={styles.header}>
            <Icon name="arrow-left" size={24} color="#000" />
            <Text style={styles.headerText}>Your Profile</Text>
          </View>

          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <Image
                source={{ uri: "https://via.placeholder.com/150" }} // Thay bằng đường dẫn ảnh của bạn
                style={styles.profileImage}
              />
              <TouchableOpacity style={styles.cameraIcon}>
                <Ionicons name="camera" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.profileName}>James Bowen</Text>
            <Text style={styles.profileInfo}>
              23 year old dev from Antarctica
            </Text>
            <Text style={styles.profileActive}>Active since - Sep, 2023</Text>
          </View>

          <View style={styles.personalInfoSection}>
            <Text style={styles.sectionTitle}>Personal Info</Text>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>

            <View style={styles.infoItem}>
              <Ionicons name="mail-outline" size={20} color="#000" />
              <Text style={styles.infoText}>jbowen@gmail.com</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="call-outline" size={20} color="#000" />
              <Text style={styles.infoText}>{authState.token}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={20} color="#000" />
              <Text style={styles.infoText}>Antarctica</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="transgender-outline" size={20} color="#000" />
              <Text style={styles.infoText}>Gender</Text>
            </View>
          </View>
          <View style={styles.utilitiesSection}>
            <Text style={styles.utilityItem}>Change pasword</Text>
            <Text style={styles.utilityItem}>Downloads</Text>
            <Text style={styles.utilityItem}>Help</Text>
            <Text style={styles.utilityItem}>Log Out</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFC323",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginTop: 30,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  profileSection: {
    alignItems: "center",
    marginTop: 16,
  },
  profileImageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FFC107",
    borderRadius: 50,
    padding: 4,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 8,
  },
  profileInfo: {
    color: "#666",
    fontSize: 16,
  },
  profileActive: {
    color: "#888",
    fontSize: 14,
    marginTop: 4,
  },
  personalInfoSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  editButton: {
    position: "absolute",
    right: 16,
    top: 0,
  },
  editButtonText: {
    color: "#000",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  infoText: {
    marginLeft: 16,
    fontSize: 16,
  },
  utilitiesSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  utilityItem: {
    fontSize: 16,
    color: "#007BFF",
    marginTop: 16,
  },
});

export default DriverProfile;

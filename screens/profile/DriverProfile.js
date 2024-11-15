import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAuth } from "../../provider/AuthProvider";

const DriverProfile = () => {
  const { authState } = useAuth();
  const [personalInfo, setPersonalInfo] = useState({});
  const [address, setAddress] = useState({});
  const [bank, setBank] = useState({});

  useEffect(() => {
    setPersonalInfo(authState.user.personalInfo);
    setAddress(authState.user.personalInfo.address);
    setBank(authState.user.bankAccount);
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
        <View style={styles.header}>
          <Icon name="arrow-left" size={24} color="#fff" />
          <Text style={styles.headerText}>Your Profile</Text>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{
                uri: personalInfo.avatar
                  ? personalInfo.avatar
                  : "https://via.placeholder.com/150",
              }}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.cameraIcon}>
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>
            {personalInfo.firstName} {personalInfo.lastName}
          </Text>
        </View>

        <View style={styles.personalInfoSection}>
          <Text style={styles.sectionTitle}>Personal Info</Text>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
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
            <Text style={styles.infoText}>Gender</Text>
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
          <TouchableOpacity style={styles.utilityItem}>
            <Ionicons name="lock-closed-outline" size={20} color="#007BFF" />
            <Text style={styles.utilityText}>Change Password</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.utilityItem}>
            <Ionicons name="download-outline" size={20} color="#007BFF" />
            <Text style={styles.utilityText}>Downloads</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.utilityItem}>
            <Ionicons name="help-circle-outline" size={20} color="#007BFF" />
            <Text style={styles.utilityText}>Help</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.lastUtilityItem}>
            <Ionicons name="log-out-outline" size={20} color="#007BFF" />
            <Text style={styles.utilityText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    fontSize: 16,
    color: "#007BFF",
    marginLeft: 10,
  },
  lastUtilityItem: {
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
    marginBottom: 30,
  },
});

export default DriverProfile;

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
  PermissionsAndroid,
} from "react-native";
import axios from "axios";
import { IP_ADDRESS } from "@env";
import { useAuth } from "../../provider/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import SendSMS from "react-native-sms";

const EmergencyContactsScreen = ({ route, navigation }) => {
  const [emergencyContact, setEmergencyContact] = useState(null);
  const [loading, setLoading] = useState(true);

  const { authState } = useAuth();
  const driverId = "673170d4b61da1537e89b5af";
  useEffect(() => {
    console.log("token  : " + authState.user_id);
  }, []);
  useEffect(() => {
    requestCallPermission();
    fetchEmergencyContact();
  }, []);

  // Yêu cầu quyền gọi điện trên Android
  const requestCallPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.SEND_SMS,
        {
          title: "Cấp quyền gọi điện",
          message: "Ứng dụng cần quyền để thực hiện cuộc gọi khẩn cấp.",
          buttonPositive: "Đồng ý",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };
  const fetchEmergencyContact = async () => {
    try {
      const response = await axios.get(
        `https://flexiride.onrender.com/driver/detail/${driverId}`
      );
      if (response.data && response.data.driver) {
        setEmergencyContact(response.data.driver.personalInfo.emergencyContact);
      } else {
        Alert.alert("Lỗi", "Không tìm thấy thông tin liên lạc khẩn cấp.");
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin tài xế:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin liên lạc khẩn cấp.");
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phoneNumber) => {
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          Alert.alert("Lỗi", "Thiết bị của bạn không hỗ trợ gọi điện.");
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) => {
        console.error("Lỗi khi gọi điện:", err);
        Alert.alert("Lỗi", `Không thể gọi điện. Chi tiết: ${err.message}`);
      });
  };

  //   const handleText = (phoneNumber) => {
  //     const url = `sms:${phoneNumber}`;

  //     Linking.canOpenURL(url)
  //       .then((supported) => {
  //         if (!supported) {
  //           Alert.alert("Lỗi", "Thiết bị không hỗ trợ gửi tin nhắn.");
  //         } else {
  //           return Linking.openURL(url);
  //         }
  //       })
  //       .catch((err) => {
  //         console.error("Lỗi khi gửi tin nhắn:", err);
  //         Alert.alert("Lỗi", `Không thể gửi tin nhắn. Chi tiết: ${err.message}`);
  //       });
  //   };
  const handleText = (phoneNumber) => {
    SendSMS.send(
      {
        body: "Tôi cần hỗ trợ khẩn cấp. Vui lòng liên hệ lại.",
        recipients: [phoneNumber],
        successTypes: ["sent", "queued"],
      },
      (completed, cancelled, error) => {
        if (completed) {
          Alert.alert("Thành công", "Tin nhắn đã được gửi.");
        } else if (cancelled) {
          Alert.alert("Đã hủy", "Bạn đã hủy gửi tin nhắn.");
        } else {
          Alert.alert("Lỗi", `Không thể gửi tin nhắn: ${error}`);
        }
      }
    );
  };
  if (!emergencyContact) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Không có thông tin liên lạc khẩn cấp.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="black" />
        <Text style={styles.backText}> Quay lại</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Liên lạc khẩn cấp</Text>
      <View style={styles.contactItem}>
        <View>
          <Text style={styles.contactName}>{emergencyContact.fullName}</Text>
          <Text style={styles.contactPhone}>
            {emergencyContact.phoneNumber}
          </Text>
          <Text style={styles.contactRelation}>
            {emergencyContact.relationship}
          </Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => handleCall(emergencyContact.phoneNumber)}
          >
            <Ionicons name="call-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.textButton}
            onPress={() => handleText(emergencyContact.phoneNumber)}
          >
            <Ionicons name="chatbubble-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 10,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
  },
  contactPhone: {
    fontSize: 14,
    color: "#555",
  },
  contactRelation: {
    fontSize: 14,
    color: "#999",
    marginBottom: 5,
  },
  actionButtons: {
    flexDirection: "row",
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginRight: 10,
  },
  textButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2196F3",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },

  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
});

export default EmergencyContactsScreen;

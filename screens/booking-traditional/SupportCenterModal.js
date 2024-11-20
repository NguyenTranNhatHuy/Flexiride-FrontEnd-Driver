import React, { useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Share,
  Linking,
  Alert,
  PermissionsAndroid,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import call from "react-native-phone-call"; // Import thư viện hỗ trợ gọi điện

const SupportCenterModal = ({
  visible,
  onClose,
  bookingDetails,
  currentLocation,
  navigation,
}) => {
  useEffect(() => {
    requestCallPermission(); // Yêu cầu quyền khi modal được mở
  }, []);

  // Yêu cầu quyền gọi điện trên Android
  const requestCallPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CALL_PHONE,
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

  // Hàm thực hiện cuộc gọi cảnh sát
  const handleCallPolice = async () => {
    const phoneNumber = "113"; // Số điện thoại cảnh sát
    const hasPermission = await requestCallPermission(); // Kiểm tra quyền gọi điện

    if (!hasPermission) {
      Alert.alert("Lỗi", "Ứng dụng chưa được cấp quyền gọi điện.");
      return;
    }

    const args = {
      number: phoneNumber,
      prompt: true, // Hiển thị xác nhận trước khi thực hiện cuộc gọi
    };

    call(args)
      .then(() => console.log("Gọi cảnh sát thành công"))
      .catch((error) => {
        console.error("Lỗi khi gọi cảnh sát:", error);
        Alert.alert("Lỗi", "Không thể thực hiện cuộc gọi.");
      });
  };

  // Hàm chia sẻ chi tiết chuyến đi
  const handleShare = async () => {
    try {
      const message = `
        📍 Chi tiết chuyến đi của tôi:
        - Điểm đón: ${bookingDetails.pickupLocation.address}
        - Điểm đến: ${bookingDetails.destinationLocation.address}
        - Vị trí hiện tại: (${currentLocation.latitude}, ${
        currentLocation.longitude
      })
        - Giá: ${
          bookingDetails.price
            ? `${bookingDetails.price} VND`
            : "Đang tính toán"
        }
        - Dịch vụ: ${bookingDetails.serviceName}
      `;
      const result = await Share.share({ message });

      if (result.action === Share.sharedAction) {
        console.log("Chia sẻ thành công!");
      } else if (result.action === Share.dismissedAction) {
        console.log("Người dùng đóng chia sẻ.");
      }
    } catch (error) {
      console.error("Lỗi chia sẻ:", error);
    }
  };
  const handleOpenEmergencyContacts = () => {
    onClose();
    navigation.navigate("EmergencyContactSupport");
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Trung tâm An toàn</Text>
          <TouchableOpacity style={styles.option} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="black" />
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Chia sẻ chi tiết chuyến đi</Text>
              <Text style={styles.optionDescription}>
                Gửi vị trí trực tiếp và tình trạng chuyến đi của bạn cho gia
                đình và bạn bè.
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.option}
            onPress={handleOpenEmergencyContacts}
          >
            <Ionicons name="alert-circle-outline" size={24} color="black" />
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Báo cáo sự cố an toàn</Text>
              <Text style={styles.optionDescription}>
                Hãy cho chúng tôi biết những nỗi lo của bạn về vấn đề an toàn.
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={handleCallPolice}>
            <Ionicons name="call-outline" size={24} color="red" />
            <View style={styles.optionTextContainer}>
              <Text style={[styles.optionTitle, { color: "red" }]}>
                Tôi cần cảnh sát
              </Text>
              <Text style={styles.optionDescription}>
                Phát động cuộc gọi cho cảnh sát. Các số liên lạc khẩn cấp của
                bạn sẽ nhận được tin nhắn SMS.
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  optionTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  optionDescription: {
    fontSize: 14,
    color: "#555",
  },
  closeButton: {
    marginTop: 20,
    alignSelf: "center",
    padding: 10,
    backgroundColor: "#ccc",
    borderRadius: 5,
  },
  closeButtonText: {
    fontSize: 16,
  },
});

export default SupportCenterModal;

import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SupportCenterModal = ({ visible, onClose }) => {
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
          <TouchableOpacity style={styles.option}>
            <Ionicons name="share-outline" size={24} color="black" />
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Chia sẻ chi tiết chuyến đi</Text>
              <Text style={styles.optionDescription}>
                Gửi vị trí trực tiếp và tình trạng chuyến đi của bạn cho gia
                đình và bạn bè.
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option}>
            <Ionicons name="alert-circle-outline" size={24} color="black" />
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Báo cáo sự cố an toàn</Text>
              <Text style={styles.optionDescription}>
                Hãy cho chúng tôi biết những nỗi lo của bạn về vấn đề an toàn
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option}>
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

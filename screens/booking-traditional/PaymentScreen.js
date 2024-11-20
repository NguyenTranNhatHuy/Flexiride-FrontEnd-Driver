import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import axios from "axios";
import { formatCurrency } from "../../utils/FormatPrice";
import { IP_ADDRESS } from "@env";
import { TextInput } from "react-native-gesture-handler";

const PaymentScreen = ({ route, navigation }) => {
  const { bookingDetails, distance, duration } = route.params;
  const [tollFee, setTollFee] = useState(0); // Lệ phí cầu đường
  const [extraFee, setExtraFee] = useState(0); // Phụ phí
  const updateRequestStatus = async (requestId) => {
    try {
      await axios.put(
        `http://${IP_ADDRESS}:3000/booking-traditional/update-status/${requestId}`,
        { status: "completed" }
      );
      Alert.alert("Thông báo", "Chuyến đi đã được hoàn thành!");
    } catch (error) {
      console.error("Error updating status:", error);
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái chuyến đi.");
    }
  };
  const calculateTotal = () => {
    return bookingDetails.price + Number(tollFee) + Number(extraFee);
  };

  const handleConfirmPayment = () => {
    updateRequestStatus(bookingDetails.requestId);
    navigation.navigate("DriverScreen"); // Điều hướng về màn hình chính sau khi hoàn tất thanh toán
  };

  return (
    <View style={styles.container}>
      {/* Tiêu đề */}
      <Text style={styles.header}>
        Thanh toán cho {bookingDetails.customerName}
      </Text>

      {/* Số tiền */}
      <View style={styles.paymentContainer}>
        <Text style={styles.amount}>{calculateTotal()}₫</Text>
        <Text style={styles.paymentStatus}>Không cần thu tiền mặt.</Text>
      </View>

      {/* Các khoản phí */}
      <View style={styles.feesContainer}>
        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Lệ phí cầu đường</Text>
          <TextInput
            style={styles.feeInput}
            placeholder="0"
            keyboardType="numeric"
            value={tollFee.toString()}
            onChangeText={(value) => setTollFee(value)}
          />
        </View>
        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Phụ phí</Text>
          <TextInput
            style={styles.feeInput}
            placeholder="0"
            keyboardType="numeric"
            value={extraFee.toString()}
            onChangeText={(value) => setExtraFee(value)}
          />
        </View>
      </View>

      {/* Nút xác nhận thanh toán */}
      <TouchableOpacity
        style={styles.confirmButton}
        onPress={handleConfirmPayment}
      >
        <Text style={styles.confirmButtonText}>Xác nhận thanh toán</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#333",
    padding: 20,
  },
  header: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  paymentContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  amount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  paymentStatus: {
    fontSize: 16,
    color: "#ccc",
    marginTop: 10,
  },
  feesContainer: {
    backgroundColor: "#444",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  feeLabel: {
    color: "#fff",
    fontSize: 16,
  },
  feeInput: {
    backgroundColor: "#555",
    color: "#fff",
    paddingHorizontal: 10,
    borderRadius: 5,
    width: 100,
    textAlign: "right",
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default PaymentScreen;

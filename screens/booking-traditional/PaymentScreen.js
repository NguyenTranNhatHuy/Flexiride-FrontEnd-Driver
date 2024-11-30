import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { formatCurrency } from "../../utils/FormatPrice";
import { IP_ADDRESS } from "@env";
import { useFocusEffect } from "@react-navigation/native"; // Import hook
import moment from "moment-timezone";
import { useAuth } from "../../provider/AuthProvider";

const PaymentScreen = ({ route, navigation }) => {
  const bookingDetails = route.params?.bookingDetails;
  const requestId = route.params?.requestId;

  const [tollFee, setTollFee] = useState(0);
  const [extraFee, setExtraFee] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [request, setRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { authState } = useAuth();

  // useFocusEffect(
  //   React.useCallback(() => {
  //     const checkStatus = async () => {
  //       try {
  //         const response = await axios.get(
  //           `https://flexiride-backend.onrender.com/booking-traditional/request/${bookingDetails.requestId}`
  //         );

  //         if (response.data?.status === "completed") {
  //           Alert.alert("Thông báo", "Chuyến đi đã hoàn thành!");
  //           navigation.navigate("DriverScreen"); // Điều hướng đến Home nếu đã hoàn thành
  //         } else {
  //           setIsLoading(false); // Cho phép tiếp tục nếu chưa hoàn thành
  //         }
  //       } catch (error) {
  //         console.error("Error checking request status:", error);
  //         Alert.alert("Lỗi", "Không thể kiểm tra trạng thái yêu cầu.");
  //         setIsLoading(false);
  //       }
  //     };

  //     checkStatus();
  //   }, [bookingDetails.requestId, navigation]) // Dependency array
  // );

  // if (isLoading) {
  //   return (
  //     <View style={styles.container}>
  //       <Text style={styles.loadingText}>Đang kiểm tra trạng thái...</Text>
  //     </View>
  //   );
  // }
  useEffect(() => {
    console.log("bookingDetails: ", bookingDetails);
    console.log("ip address: ", IP_ADDRESS);

    console.log("requestId: ", requestId);
    fetchRequestDetail(requestId);
  }, []);

  const fetchRequestDetail = async (requestId) => {
    try {
      const response = await axios.get(
        `https://flexiride-backend.onrender.com/booking-traditional/request/${requestId}`
      );

      if (response.data) {
        setRequest(response.data);

        console.log("Request data: ", response.data);
      } else {
        console.log("No request found for the given moment");
        Alert.alert(
          "Lỗi",
          "Không tìm thấy yêu cầu nào khớp với thời gian đã chọn."
        );
      }
    } catch (error) {
      console.error("Error fetching request details:", error);
      Alert.alert("Lỗi", "Không thể lấy thông tin yêu cầu");
    }
  };
  const updateRequestStatus = async (requestId) => {
    try {
      console.log("🚀 ~ updateRequestStatus ~ requestId:", requestId);

      await axios.put(
        `https://flexiride-backend.onrender.com/booking-traditional/update-status/${requestId}`,
        { status: "completed" }
      );

      const paymentData = {
        requestId,
        userId: request?.account_id,
        driverId: authState.userId,
        payment_method: request?.payment_method,
        amount: calculateTotal(),
        pickup:
          bookingDetails.pickupLocation.name +
          ", " +
          bookingDetails.pickupLocation.address,
        destination:
          bookingDetails.destinationLocation.name +
          ", " +
          bookingDetails.destinationLocation.address,
        serviceId: request?.service_option_id,
      };
      console.log("🚀 ~ updateRequestStatus ~ paymentData:", paymentData);

      await axios.post(
        `https://flexiride-backend.onrender.com/payment-history/create`,
        paymentData
      );

      Alert.alert(
        "Thông báo",
        "Chuyến đi đã hoàn thành và lịch sử thanh toán đã được lưu!"
      );
      navigation.replace("DriverScreen");
    } catch (error) {
      console.error("Error updating status or saving payment history:", error);
      Alert.alert(
        "Lỗi",
        "Không thể cập nhật trạng thái chuyến đi hoặc lưu lịch sử thanh toán."
      );
    }
  };

  const calculateTotal = () => {
    return request?.price + Number(tollFee) + Number(extraFee);
  };

  const handleConfirmPayment = () => {
    setIsModalVisible(true);
  };

  const confirmPaymentFinal = () => {
    setIsModalVisible(false);
    updateRequestStatus(requestId);
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Payment Details */}
      <View style={styles.paymentContainer}>
        <Text style={styles.header}>Thanh toán</Text>
        <Text style={styles.customerName}>
          Khách hàng: {bookingDetails.customerName}
        </Text>
        <Text style={styles.amount}>{formatCurrency(calculateTotal())}</Text>
        <Text style={styles.paymentStatus}>
          {request?.payment_method === "cash"
            ? "Tiền mặt"
            : "Thanh toán online"}
        </Text>
      </View>

      {/* Fees */}
      <View style={styles.feesContainer}>
        <View style={styles.feeRow}>
          <MaterialIcons name="toll" size={20} color="#FFC107" />
          <Text style={styles.feeLabel}>Lệ phí cầu đường</Text>
          <TextInput
            style={styles.feeInput}
            placeholder="Nhập lệ phí"
            keyboardType="numeric"
            value={tollFee.toString()}
            onChangeText={(value) => setTollFee(value)}
          />
        </View>
        <View style={styles.feeRow}>
          <Ionicons name="add-circle" size={20} color="#FFC107" />
          <Text style={styles.feeLabel}>Phụ phí</Text>
          <TextInput
            style={styles.feeInput}
            placeholder="Nhập phụ phí"
            keyboardType="numeric"
            value={extraFee.toString()}
            onChangeText={(value) => setExtraFee(value)}
          />
        </View>
      </View>

      {/* Confirm Button */}
      <TouchableOpacity
        style={styles.confirmButton}
        onPress={handleConfirmPayment}
      >
        <Text style={styles.confirmButtonText}>Xác nhận thanh toán</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              Bạn vừa nhận được tiền mặt đúng không?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={confirmPaymentFinal}
              >
                <Text style={styles.modalButtonText}>Có</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Không</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    padding: 20,
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    marginTop: 80,
    textAlign: "center",
  },
  customerName: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 10,
    textAlign: "center",
  },
  paymentContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  amount: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 10,
  },
  paymentStatus: {
    fontSize: 14,
    color: "#aaa",
  },
  feesContainer: {
    backgroundColor: "#2E2E2E",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  feeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  feeLabel: {
    fontSize: 16,
    color: "#fff",
    flex: 1,
    marginLeft: 10,
  },
  feeInput: {
    backgroundColor: "#444",
    color: "#fff",
    borderRadius: 5,
    padding: 10,
    width: 100,
    textAlign: "right",
  },
  confirmButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#FFC107",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    elevation: 5,
  },
  confirmButtonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: "center",
    backgroundColor: "#4CAF50",
  },
  modalCancelButton: {
    backgroundColor: "#F44336",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PaymentScreen;

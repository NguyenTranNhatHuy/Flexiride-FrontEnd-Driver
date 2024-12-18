import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { formatCurrency } from "../../utils/FormatPrice";
import { IP_ADDRESS } from "@env";
import { useFocusEffect } from "@react-navigation/native"; // Import hook
import moment from "moment-timezone";
import { useAuth } from "../../provider/AuthProvider";
import WebView from "react-native-webview";

const PaymentScreen = ({ route, navigation }) => {
  const requestId = route.params?.requestId;

  const customerName = route.params?.customerName || "";

  const [tollFee, setTollFee] = useState(0);
  const [extraFee, setExtraFee] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [request, setRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { authState } = useAuth();
  const [paymentUrl, setPaymentUrl] = useState(null);

  useEffect(() => {
    fetchRequestDetail(requestId || request._id);
  }, []);

  const fetchRequestDetail = async (requestId) => {
    try {
      const response = await axios.get(
        `https://flexiride.onrender.com/booking-traditional/request/${requestId}`
      );

      if (response.data) {
        setRequest(response.data);
        console.log("🚀 ~ fetchRequestDetail ~ response.data:", response.data);
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
      await axios.put(
        `https://flexiride.onrender.com/booking-traditional/update-status/${requestId}`,
        { status: "completed" }
      );

      const paymentData = {
        requestId,
        userId: request?.account_id,
        driverId: authState.userId,
        payment_method: request?.payment_method,
        amount: calculateTotal(),
        pickup: request.pickup,
        destination: request.destination,
        serviceId: request?.service_option_id,
      };

      await axios.post(
        `https://flexiride.onrender.com/payment-history/create`,
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

  const handlePayment = async () => {
    try {
      setIsLoading(true);

      const response = await axios.post(
        `https://flexiride.onrender.com/payment-history/create-payos`,
        {
          userId: request.account_id,
          amount: parseFloat(request.price),
          type: "SERVICE_BOOKING",
        }
      );

      const { paymentUrl } = response.data;

      if (paymentUrl) {
        setPaymentUrl(paymentUrl); // Hiển thị WebView
      } else {
        Alert.alert("Error", "Failed to create payment link.  ");
      }
    } catch (error) {
      console.error("Error creating payment link:", error);
      Alert.alert("Error", "Unable to create payment link.");
    } finally {
      setIsLoading(false);
    }
  };

  // Hiển thị WebView nếu có paymentUrl
  if (paymentUrl) {
    return (
      <WebView
        source={{ uri: paymentUrl }}
        onNavigationStateChange={(navState) => {
          const { url } = navState;
          if (url.includes("ReturnScreen")) {
            Alert.alert("Success", "Payment completed successfully.", [
              { text: "OK", onPress: () => navigation.goBack() },
            ]);
            setPaymentUrl(null);
          } else if (url.includes("CancelScreen")) {
            Alert.alert("Cancelled", "Payment was cancelled.", [
              { text: "OK", onPress: () => setPaymentUrl(null) },
            ]);
          }
        }}
        startInLoadingState
        renderError={() => (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Failed to load payment page.</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => setPaymentUrl(paymentUrl)}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    );
  }

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

      {/* Nội dung cuộn */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Payment Details */}
        <View style={styles.paymentContainer}>
          <Text style={styles.header}>Thanh toán</Text>
          <Text style={styles.customerName}>Khách hàng: {customerName}</Text>
          <Text style={styles.amount}>{formatCurrency(calculateTotal())}</Text>
        </View>

        {/* Trip Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.detailRow}>
            <Text style={styles.detailLabel}>Điểm đón: </Text>
            {request?.pickup}
          </Text>
          <Text style={styles.detailRow}>
            <Text style={styles.detailLabel}>Điểm đến: </Text>
            {request?.destination}
          </Text>
          <Text style={styles.detailRow}>
            <Text style={styles.detailLabel}>Giá cước: </Text>
            {formatCurrency(request?.price || 0)}
          </Text>
          <Text style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phương thức thanh toán: </Text>
            {request?.payment_method === "cash"
              ? "Tiền mặt"
              : "Thanh toán online"}
          </Text>
          <Text style={styles.detailRow}>
            <Text style={styles.detailLabel}>Thời gian đặt: </Text>
            {moment(request?.moment_book)
              .tz("Asia/Ho_Chi_Minh")
              .format("HH:mm, DD-MM-YYYY")}
          </Text>
        </View>
      </ScrollView>

      {/* Nút xác nhận thanh toán */}
      <TouchableOpacity
        style={styles.confirmButton}
        onPress={
          request?.payment_method === "cash"
            ? handleConfirmPayment
            : handlePayment
        }
      >
        <Text style={styles.confirmButtonText}>
          {request?.payment_method === "cash"
            ? "Xác nhận thanh toán"
            : "Thanh toán qua PayOS"}
        </Text>
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
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Để trống phía dưới cho nút xác nhận
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
    textAlign: "center",
    marginTop: 60, // Khoảng cách để không che nút Back
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
  detailsContainer: {
    backgroundColor: "#2E2E2E",
    padding: 15,
    borderRadius: 10,
    marginVertical: 20,
  },
  detailRow: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 10,
  },
  detailLabel: {
    fontWeight: "bold",
    color: "#FFC107",
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

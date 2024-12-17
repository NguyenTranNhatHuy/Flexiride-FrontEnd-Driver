import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import axios from "axios";
import { IP_ADDRESS } from "@env";
import { useAuth } from "../../provider/AuthProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const ReturnBooking = ({ route, navigation }) => {
  const { id: paymentId, status, orderCode } = route.params;
  const { authState } = useAuth();
  const driverId = authState.userId;

  const [activeBooking, setActiveBooking] = useState(null);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false); // Flag to prevent duplicate API calls

  // Load active booking from AsyncStorage
  const loadActiveBooking = async () => {
    try {
      const booking = await AsyncStorage.getItem("activeBooking");
      if (booking) {
        const parsedBooking = JSON.parse(booking);
        setActiveBooking(parsedBooking);
      } else {
        console.error("Không tìm thấy dữ liệu activeBooking.");
      }
    } catch (error) {
      console.error("Error loading active booking: ", error);
    }
  };

  // Fetch request details
  useEffect(() => {
    const fetchRequestDetail = async () => {
      if (!activeBooking || !activeBooking.moment_book) {
        Alert.alert("Lỗi", "Không tìm thấy thông tin đặt chỗ.");
        setLoading(false);
        return;
      }

      try {
        console.log(
          "🚀 Fetching request for moment_book:",
          activeBooking.moment_book
        );
        const response = await axios.get(
          `http://${IP_ADDRESS}:3000/booking-traditional/request-by-moment/${activeBooking.moment_book}`
        );

        if (response.data) {
          setRequest(response.data);
        } else {
          console.error("API không trả về dữ liệu request.");
          Alert.alert("Lỗi", "Không thể lấy thông tin yêu cầu.");
        }
      } catch (error) {
        console.error(
          "Error fetching request details:",
          error.response?.data || error.message
        );
        Alert.alert("Lỗi", "Không thể lấy thông tin yêu cầu.");
        navigation.replace("DriverScreen");
      } finally {
        setLoading(false);
      }
    };

    if (activeBooking) fetchRequestDetail();
  }, [activeBooking]);

  // Handle successful payment return
  const handleReturnSuccess = async () => {
    if (isProcessing) return; // Prevent duplicate calls
    setIsProcessing(true);

    try {
      if (!request || !request._id) {
        console.error("Dữ liệu request không hợp lệ hoặc bị thiếu:", request);
        throw new Error("Dữ liệu request không hợp lệ hoặc bị thiếu.");
      }

      console.log("🚀 request._id fetched:", request._id);

      // Update booking status to "completed"
      await axios.put(
        `http://${IP_ADDRESS}:3000/booking-traditional/update-status/${request._id}`,
        { status: "completed" }
      );

      // Prepare payment data
      const paymentData = {
        requestId: request._id,
        userId: request?.account_id || "Unknown User",
        driverId: authState.userId,
        payment_method: request?.payment_method || "Unknown",
        amount: request?.price || 0,
        pickup: request?.pickup || "Không rõ điểm đón",
        destination: request?.destination || "Không rõ điểm đến",
        serviceId: request?.service_option_id || null,
        paymentId: paymentId,
      };

      console.log("🚀 ~ Payment Data:", paymentData);

      // Call the payment history API
      const paymentResponse = await axios.post(
        `http://${IP_ADDRESS}:3000/payment-history/return-successfully`,
        paymentData,
        {
          headers: { Authorization: `Bearer ${authState.token}` },
        }
      );

      Alert.alert("Thành công", paymentResponse.data.message, [
        {
          text: "OK",
          onPress: () => navigation.navigate("DriverScreen"),
        },
      ]);
    } catch (error) {
      console.error(
        "Lỗi xử lý thanh toán:",
        error.response?.data || error.message
      );
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Không thể xử lý giao dịch."
      );
    } finally {
      setIsProcessing(false); // Reset flag after processing
    }
  };

  // Trigger handleReturnSuccess if status is "PAID" and request is ready
  useEffect(() => {
    if (status === "PAID" && request && !loading) {
      handleReturnSuccess();
    } else if (!request && !loading) {
      console.error("Lỗi: Dữ liệu request không sẵn sàng.");
      Alert.alert(
        "Lỗi",
        "Không thể xử lý giao dịch do thiếu thông tin yêu cầu."
      );
      navigation.navigate("DriverScreen");
    }
  }, [status, request, loading]);

  useFocusEffect(
    useCallback(() => {
      loadActiveBooking();
    }, [])
  );

  // Render processing screen
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Đang xử lý giao dịch...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
});

export default ReturnBooking;

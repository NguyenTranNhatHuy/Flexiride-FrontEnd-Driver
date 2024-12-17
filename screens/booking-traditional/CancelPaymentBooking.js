import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";

const CancelBooking = ({ route, navigation }) => {
  const { id: paymentId, orderCode } = route.params || {};
  const [activeBooking, setActiveBooking] = useState(null);
  const [request, setRequest] = useState(null);

  const loadActiveBooking = async () => {
    try {
      const booking = await AsyncStorage.getItem("activeBooking");
      if (booking) {
        const parsedBooking = JSON.parse(booking);
        setActiveBooking(parsedBooking);
      }
    } catch (error) {
      console.error("Error loading active booking: ", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadActiveBooking();
    }, [])
  );

  useEffect(() => {
    const fetchRequestDetail = async () => {
      if (activeBooking?.moment_book) {
        try {
          const response = await axios.get(
            `https://flexiride.onrender.com/booking-traditional/request-by-moment/${activeBooking.moment_book}`
          );
          if (response.data) {
            setRequest(response.data);
            console.log("🚀 Request fetched:", response.data._id);
          }
        } catch (error) {
          console.error("Error fetching request details:", error);
          Alert.alert("Lỗi", "Không thể lấy thông tin yêu cầu.");
          navigation.replace("Home");
        }
      }
    };

    if (activeBooking) fetchRequestDetail();
  }, [activeBooking]);

  // Xử lý khi không có paymentId hoặc orderCode
  useEffect(() => {
    if (!paymentId || !orderCode) {
      Alert.alert(
        "Lỗi",
        "Không tìm thấy thông tin giao dịch. Vui lòng kiểm tra lại.",
        [
          {
            text: "OK",
            onPress: () => {
              if (request?._id) {
                navigation.replace("PaymentScreen", {
                  requestId: request._id, // Truyền requestId
                });
              } else {
                navigation.navigate("Home");
              }
            },
          },
        ]
      );
    }
  }, [paymentId, orderCode, navigation, request?._id]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Giao dịch đã bị hủy.</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          if (request?._id) {
            navigation.replace("PaymentScreen", {
              requestId: request._id, // Chuyển đúng requestId
            });
          } else {
            Alert.alert("Lỗi", "Không tìm thấy thông tin thanh toán.");
          }
        }}
      >
        <Text style={styles.buttonText}>Quay lại thanh toán</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#FF6347",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    elevation: 3,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CancelBooking;

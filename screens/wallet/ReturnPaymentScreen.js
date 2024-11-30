import React, { useEffect } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import axios from "axios";
import { IP_ADDRESS } from "@env";
import { useAuth } from "../../provider/AuthProvider";

const ReturnScreen = ({ route, navigation }) => {
  const { id: paymentId, status, orderCode } = route.params;
  const { authState } = useAuth();
  const driverId = authState.userId;
  const amount = 100000;
  useEffect(() => {
    const handleReturnTopup = async () => {
      try {
        const response = await axios.post(
          `https://flexiride.onrender.com/driver/wallet/return-topup`,
          { paymentId, status, orderCode, driverId, amount },
          {
            headers: {
              Authorization: `Bearer ${authState.token}`, // Truyền token vào header
            },
          }
        );

        Alert.alert("Thành công", response.data.message, [
          {
            text: "OK",
            onPress: () => navigation.navigate("WalletScreen"),
          },
        ]);
      } catch (error) {
        console.error("Lỗi return-topup:", error);
        Alert.alert("Lỗi", "Không thể xử lý giao dịch thành công.");
      }
    };

    if (status === "PAID") {
      handleReturnTopup();
    } else {
      Alert.alert("Lỗi", "Giao dịch không thành công.");
      navigation.navigate("WalletScreen");
    }
  }, [
    paymentId,
    status,
    orderCode,
    driverId,
    amount,
    navigation,
    authState.token,
  ]);

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
  button: {
    backgroundColor: "#FFB400",
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

export default ReturnScreen;

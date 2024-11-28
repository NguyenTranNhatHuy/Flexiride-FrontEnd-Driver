import React, { useEffect } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";

const CancelScreen = ({ route, navigation }) => {
  const { id: paymentId, orderCode } = route.params || {};

  const handleCancelTransaction = () => {
    Alert.alert("Giao dịch đã bị hủy", "Bạn đã hủy giao dịch nạp tiền.", [
      {
        text: "OK",
        onPress: () => navigation.navigate("WalletScreen"),
      },
    ]);
  };

  useEffect(() => {
    if (!paymentId || !orderCode) {
      Alert.alert(
        "Lỗi",
        "Không tìm thấy thông tin giao dịch. Vui lòng kiểm tra lại.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("WalletScreen"),
          },
        ]
      );
    } else {
      handleCancelTransaction();
    }
  }, [paymentId, orderCode, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Giao dịch đã bị hủy.</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("WalletScreen")}
      >
        <Text style={styles.buttonText}>Quay lại ví</Text>
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

export default CancelScreen;

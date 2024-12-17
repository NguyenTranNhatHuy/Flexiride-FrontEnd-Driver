import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";

export const ServiceSelectionScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chọn Dịch Vụ</Text>

      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("DriverAvailableRides")}
      >
        <Text style={styles.buttonText}>Nhận chuyến xe ghép</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("ManageDriverRides")}
      >
        <Text style={styles.buttonText}>Quản lý các chuyến</Text>
      </TouchableOpacity>
      <Image source={require("../../assets/splash.png")} style={styles.logo} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f7", // Nền màu sáng thân thiện
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1e293b", // Màu chữ dịu, dễ nhìn
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#4CAF50", // Màu xanh lá tạo cảm giác thân thiện
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 25, // Bo góc tròn hơn
    marginVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4, // Hiệu ứng nổi
    width: "80%", // Độ rộng cố định theo màn hình
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import axios from "axios";
import { IP_ADDRESS } from "@env";
import { useAuth } from "../provider/AuthProvider";

const WalletScreen = ({ navigation }) => {
  const [wallets, setWallets] = useState({ cashWallet: 0, creditWallet: 0 });
  const [error, setError] = useState(null);
  const { authState } = useAuth();

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const response = await axios.get(
          `http://${IP_ADDRESS}:3000/driver/wallet/${authState.userId}/wallets`
        );
        console.log("🚀 ~ fetchWallets ~ response:", response.data);

        if (response.data && response.data.wallets) {
          setWallets(response.data.wallets);
        } else {
          setError("Không thể tải thông tin ví. Vui lòng thử lại.");
        }
      } catch (error) {
        console.error("Error fetching wallet info:", error);
        setError("Lỗi kết nối tới máy chủ. Vui lòng thử lại sau.");
      }
    };

    fetchWallets();
  }, []);

  const WalletItem = ({ label, amount, icon, onPress }) => (
    <TouchableOpacity style={styles.walletItem} onPress={onPress}>
      <View style={styles.walletIconContainer}>
        <Image source={icon} style={styles.walletIcon} />
      </View>
      <View style={styles.walletInfo}>
        <Text style={styles.walletLabel}>{label}</Text>
        <Text style={styles.walletAmount}>
          {amount.toLocaleString("vi-VN")}₫
        </Text>
      </View>
      <Text style={styles.arrow}>{`>`}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <>
          <WalletItem
            label="Ví tiền mặt"
            amount={wallets.cashWallet}
            icon={require("../assets/cash-wallet-icon.png")}
            onPress={() => console.log("Navigate to cash wallet details")}
          />
          <WalletItem
            label="Ví tín dụng"
            amount={wallets.creditWallet}
            icon={require("../assets/credit-wallet-icon.png")}
            onPress={() => console.log("Navigate to credit wallet details")}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6", // Nền sáng xám nhạt
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333", // Màu chữ tiêu đề
    marginBottom: 20,
  },
  walletItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF", // Nền thẻ sáng
    borderRadius: 15, // Bo góc mềm mại
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5, // Hiệu ứng đổ bóng hiện đại
  },
  walletIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: "#E6F7FF", // Màu nền biểu tượng
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  walletIcon: {
    width: 35,
    height: 35,
    resizeMode: "contain",
  },
  walletInfo: {
    flex: 1,
    marginLeft: 20,
  },
  walletLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333", // Màu chữ tiêu đề ví
  },
  walletAmount: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFB400", // Màu chữ số tiền vàng sang trọng
  },
  arrow: {
    fontSize: 18,
    color: "#FFB400", // Màu mũi tên phù hợp với số tiền
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333333", // Màu chữ tiêu đề tiện ích
    marginTop: 25,
    marginBottom: 15,
  },
  additionalFeatures: {
    marginTop: 10,
  },
  featureItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF", // Nền sáng cho tiện ích
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  featureImage: {
    width: 50,
    height: 50,
    marginRight: 20,
    resizeMode: "contain",
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333", // Màu chữ tiêu đề tiện ích
  },
  featureLink: {
    fontSize: 14,
    color: "#007BFF", // Màu chữ liên kết
    marginTop: 5,
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30", // Màu thông báo lỗi nổi bật
    textAlign: "center",
    marginTop: 20,
  },
});

export default WalletScreen;

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  ScrollView,
} from "react-native";
import axios from "axios";
import { IP_ADDRESS } from "@env";
import { useAuth } from "../../provider/AuthProvider";

const WalletScreen = ({ navigation }) => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const { authState } = useAuth();

  const fetchWalletBalance = async () => {
    try {
      const response = await axios.get(
        `https://flexiride.onrender.com/driver/wallet/${authState.userId}/wallet`,
        {
          headers: {
            Authorization: `Bearer ${authState.token}`, // Truyền token vào header
          },
        }
      );
      console.log("Wallet Balance Response: ", response.data);

      if (response.data && response.data.walletBalance !== undefined) {
        setWalletBalance(response.data.walletBalance);
      } else {
        setError("Không thể tải thông tin ví. Vui lòng thử lại. ");
      }
    } catch (error) {
      console.error("Error fetching wallet info:", error);
      setError("Lỗi kết nối tới máy chủ. Vui lòng thử lại sau.");
    }
  };

  useEffect(() => {
    fetchWalletBalance();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchWalletBalance();
    setIsRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <View>
          <TouchableOpacity style={styles.walletItem}>
            <View style={styles.walletIconContainer}>
              <Image
                source={require("../../assets/cash-wallet-icon.png")}
                style={styles.walletIcon}
              />
            </View>
            <View style={styles.walletInfo}>
              <Text style={styles.walletLabel}>Tổng số dư</Text>
              <Text style={styles.walletAmount}>
                {walletBalance.toLocaleString("vi-VN")}₫
              </Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.subtitle}>Tiện ích</Text>
          <TouchableOpacity
            style={styles.featureItem}
            onPress={() => navigation.navigate("TopUpScreen")}
          >
            <Image
              source={require("../../assets/cash-wallet-icon.png")}
              style={styles.featureImage}
            />
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>Nạp tiền vào ví</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.featureItem}
            onPress={() => navigation.navigate("WithdrawalScreen")}
          >
            <Image
              source={require("../../assets/cash-wallet-icon.png")}
              style={styles.featureImage}
            />
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>Rút tiền</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.featureItem}
            onPress={() => navigation.navigate("TransactionHistoryScreen")}
          >
            <Image
              source={require("../../assets/cash-wallet-icon.png")}
              style={styles.featureImage}
            />
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>Lịch sử giao dịch</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    padding: 20,
  },
  walletItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  walletIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: "#E6F7FF",
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
    fontWeight: "600",
    color: "#333333",
  },
  walletAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFB400",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333333",
    marginTop: 10,
    marginBottom: 15,
  },
  featureItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
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
    width: 40,
    height: 40,
    marginRight: 15,
    resizeMode: "contain",
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
    marginTop: 20,
  },
});

export default WalletScreen;

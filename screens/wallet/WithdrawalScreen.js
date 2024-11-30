import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { IP_ADDRESS } from "@env";
import { useAuth } from "../../provider/AuthProvider";
import { Image } from "react-native-elements";

const WithdrawalScreen = ({ navigation }) => {
  const [amount, setAmount] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);

  const [bankAccount, setBankAccount] = useState(null); // Lưu thông tin ngân hàng
  const [isLoading, setIsLoading] = useState(false);
  const { authState } = useAuth();

  // Hàm lấy thông tin ngân hàng
  const fetchBankAccountInfo = async () => {
    try {
      const response = await axios.get(
        `http://${IP_ADDRESS}:3000/driver/${authState.userId}/bank-account`,
        {
          headers: {
            Authorization: `Bearer ${authState.token}`, // Truyền token vào header
          },
        }
      );

      if (response.data.success) {
        setBankAccount(response.data.bankAccount);
      } else {
        Alert.alert("Lỗi", "Không thể lấy thông tin ngân hàng.");
      }
    } catch (error) {
      console.error("Error fetching bank account info:", error.message);
      Alert.alert("Lỗi", "Không thể kết nối tới máy chủ.");
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const response = await axios.get(
        `http://${IP_ADDRESS}:3000/driver/wallet/${authState.userId}/wallet`,
        {
          headers: {
            Authorization: `Bearer ${authState.token}`, // Truyền token vào header
          },
        }
      );

      console.log("Wallet Balance Response:", response.data);

      if (response.data && response.data.walletBalance !== undefined) {
        setWalletBalance(response.data.walletBalance);
      } else {
        setError("Không thể tải thông tin ví. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error fetching wallet info:", error.message);
      setError("Lỗi kết nối tới máy chủ. Vui lòng thử lại sau.");
    }
  };

  // Gọi API lấy thông tin ngân hàng khi màn hình được tải
  useEffect(() => {
    fetchWalletBalance();
    fetchBankAccountInfo();
  }, []);

  const handleWithdrawalRequest = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Lỗi", "Vui lòng nhập số tiền hợp lệ.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `http://${IP_ADDRESS}:3000/driver/wallet/withdraw-request`,
        {
          driverId: authState.userId,
          amount: parseFloat(amount),
        }
      );

      if (response.data.success) {
        Alert.alert("Thành công", response.data.message, [
          {
            text: "OK",
            onPress: () => {
              setAmount("");
              navigation.navigate("TransactionHistoryScreen");
            },
          },
        ]);
      } else {
        Alert.alert(
          "Lỗi",
          response.data.message || "Yêu cầu không thành công."
        );
      }
    } catch (error) {
      console.error("Error creating withdrawal request:", error.message);
      Alert.alert(
        "Lỗi",
        "Không thể gửi yêu cầu rút tiền. Vui lòng thử lại sau."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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
      {bankAccount ? (
        <View style={styles.bankInfoContainer}>
          <Text style={styles.bankInfoText}>
            <Text style={styles.bankInfoLabel}>Tên chủ tài khoản: </Text>
            {bankAccount.accountHolderName}
          </Text>
          <Text style={styles.bankInfoText}>
            <Text style={styles.bankInfoLabel}>Số tài khoản: </Text>
            {bankAccount.accountNumber}
          </Text>
          <Text style={styles.bankInfoText}>
            <Text style={styles.bankInfoLabel}>Ngân hàng: </Text>
            {bankAccount.bankName}
          </Text>
        </View>
      ) : (
        <Text style={styles.loadingText}>Đang tải thông tin ngân hàng...</Text>
      )}

      <Text style={styles.label}>Số tiền muốn rút:</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập số tiền (₫)"
        keyboardType="numeric"
        value={amount}
        onChangeText={(value) => setAmount(value)}
      />
      <TouchableOpacity
        style={[styles.button, isLoading && styles.disabledButton]}
        onPress={handleWithdrawalRequest}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Gửi yêu cầu</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F9F9F9",
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 20,
  },
  bankInfoContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    elevation: 3,
  },
  bankInfoText: {
    fontSize: 16,
    color: "#333333",
    marginBottom: 5,
  },
  bankInfoLabel: {
    fontWeight: "bold",
    color: "#555555",
  },
  loadingText: {
    fontSize: 14,
    color: "#777777",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555555",
    marginBottom: 10,
  },
  input: {
    height: 50,
    borderColor: "#CCCCCC",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#FFB400",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: "#FFD580",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default WithdrawalScreen;

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import axios from "axios";
import { IP_ADDRESS } from "@env";
import { useAuth } from "../../provider/AuthProvider";

const TopUpScreen = ({ navigation }) => {
  const [amount, setAmount] = useState(""); // Số tiền cần nạp
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading
  const [paymentUrl, setPaymentUrl] = useState(null); // URL thanh toán
  const [paymentId, setPaymentId] = useState(null); // Lưu trữ paymentId
  const { authState } = useAuth();

  const handleTopUp = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Lỗi", "Vui lòng nhập số tiền hợp lệ.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `http://${IP_ADDRESS}:3000/driver/wallet/topup`,
        {
          driverId: authState.userId,
          amount: parseFloat(amount),
        }
      );

      const { paymentUrl, paymentId } = response.data;

      if (paymentUrl && paymentId) {
        setPaymentUrl(paymentUrl); // Mở WebView để thanh toán
        setPaymentId(paymentId); // Lưu trữ paymentId để sử dụng trong callback
      } else {
        Alert.alert("Lỗi", "Không thể tạo yêu cầu nạp tiền.");
      }
    } catch (error) {
      console.error("Error topping up wallet:", error);
      Alert.alert("Lỗi", "Không thể nạp tiền. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSelect = (value) => {
    setAmount(value.toString());
  };

  const numberToWords = (num) => {
    const units = [
      "",
      "một",
      "hai",
      "ba",
      "bốn",
      "năm",
      "sáu",
      "bảy",
      "tám",
      "chín",
    ];
    const tens = [
      "",
      "mười",
      "hai mươi",
      "ba mươi",
      "bốn mươi",
      "năm mươi",
      "sáu mươi",
      "bảy mươi",
      "tám mươi",
      "chín mươi",
    ];
    const scales = ["", "nghìn", "triệu", "tỷ"];

    if (num === 0) return "không đồng";
    if (!Number.isInteger(num) || num < 0) return "Số không hợp lệ";

    let words = [];
    let scaleIndex = 0;

    while (num > 0) {
      const part = num % 1000;
      if (part > 0) {
        const partWords = [];
        const hundreds = Math.floor(part / 100);
        const remainder = part % 100;

        if (hundreds > 0) partWords.push(`${units[hundreds]} trăm`);
        if (remainder > 0) {
          if (remainder < 10) {
            partWords.push(`lẻ ${units[remainder]}`);
          } else if (remainder < 20) {
            partWords.push(`mười ${units[remainder % 10]}`);
          } else {
            const ten = Math.floor(remainder / 10);
            const unit = remainder % 10;
            partWords.push(`${tens[ten]} ${unit === 5 ? "lăm" : units[unit]}`);
          }
        }
        words.unshift(`${partWords.join(" ")} ${scales[scaleIndex]}`.trim());
      }
      num = Math.floor(num / 1000);
      scaleIndex++;
    }
    return words.join(" ").trim() + " đồng";
  };

  if (paymentUrl) {
    return (
      <WebView
        source={{ uri: paymentUrl }}
        onNavigationStateChange={(navState) => {
          const { url } = navState;
          if (url.includes("ReturnScreen")) {
            Alert.alert("Thành công", "Giao dịch đã hoàn tất.", [
              {
                text: "OK",
                onPress: () => {
                  setPaymentUrl(null);
                  navigation.goBack();
                },
              },
            ]);
          } else if (url.includes("CancelScreen")) {
            Alert.alert("Hủy bỏ", "Giao dịch đã bị hủy.", [
              {
                text: "OK",
                onPress: () => setPaymentUrl(null),
              },
            ]);
          }
        }}
        startInLoadingState
        renderLoading={() => (
          <ActivityIndicator
            size="large"
            color="#FFB400"
            style={styles.loadingIndicator}
          />
        )}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nạp tiền vào ví</Text>
      <Text style={styles.label}>Chọn số tiền:</Text>
      <View style={styles.quickSelectContainer}>
        {[100000, 200000, 1000000].map((value) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.quickSelectButton,
              amount == value.toString() && styles.quickSelectButtonSelected,
            ]}
            onPress={() => handleQuickSelect(value)}
          >
            <Text
              style={[
                styles.quickSelectButtonText,
                amount == value.toString() &&
                  styles.quickSelectButtonTextSelected,
              ]}
            >
              {value.toLocaleString("vi-VN")}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Hoặc nhập số tiền bạn muốn nạp:</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập số tiền (₫)"
        keyboardType="numeric"
        value={amount}
        onChangeText={(value) => setAmount(value)}
      />
      {amount && (
        <Text style={styles.amountInWords}>
          {numberToWords(Number(amount))}
        </Text>
      )}
      <TouchableOpacity
        style={[styles.button, isLoading && styles.disabledButton]}
        onPress={handleTopUp}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Nạp tiền</Text>
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
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
  loadingIndicator: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  quickSelectContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  quickSelectButton: {
    flex: 1,
    marginHorizontal: 2,
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  quickSelectButtonSelected: {
    borderColor: "#FFB400",
    backgroundColor: "#FFF8E1",
  },
  quickSelectButtonText: {
    fontSize: 15,
    color: "#555555",
  },
  quickSelectButtonTextSelected: {
    color: "#FFB400",
    fontWeight: "bold",
  },
  amountInWords: {
    fontSize: 14,
    color: "#555",
    fontStyle: "italic",
    marginVertical: 10,
  },
});

export default TopUpScreen;

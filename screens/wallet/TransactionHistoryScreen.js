import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";
import { IP_ADDRESS } from "@env";
import { useAuth } from "../../provider/AuthProvider";

const TransactionHistoryScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);
  const { authState } = useAuth();

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(
        `http://${IP_ADDRESS}:3000/driver/wallet/${authState.userId}/transactions`,
        {
          headers: {
            Authorization: `Bearer ${authState.token}`, // Truyền token vào header
          },
        }
      );
      if (response.data.success) {
        setTransactions(response.data.transactions);
      } else {
        Alert.alert("Lỗi", "Không thể lấy lịch sử giao dịch.");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error.message);
      Alert.alert("Lỗi", "Không thể kết nối tới máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const groupedTransactions = transactions.reduce(
    (acc, transaction) => {
      if (transaction.type === "TOPUP") {
        acc.topups.push(transaction);
      } else if (transaction.type === "WITHDRAW") {
        acc.withdraws.push(transaction);
      }
      return acc;
    },
    { topups: [], withdraws: [] }
  );

  const renderTransactionItem = (item) => {
    let statusText = "";
    let statusStyle = styles.transactionStatus; // Default style

    switch (item.status) {
      case "PENDING":
        statusText = "Đang chờ xử lý";
        statusStyle = styles.pending;
        break;
      case "PAID":
        statusText = "Hoàn thành";
        statusStyle = styles.success;
        break;
      case "FAILED":
        statusText = "Không thành công";
        statusStyle = styles.failed;
        break;
      case "CANCELLED":
        statusText = "Đã hủy";
        statusStyle = styles.cancelled;
        break;

      default:
        statusText = "Trạng thái không xác định";
    }

    return (
      <View style={styles.transactionCard} key={item._id}>
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionAmount}>
            {item.amount.toLocaleString("vi-VN")} ₫
          </Text>
          <Text style={[styles.transactionStatus, statusStyle]}>
            {statusText}
          </Text>
        </View>
        <Text style={styles.transactionDate}>
          {new Date(item.createdAt).toLocaleString("vi-VN")}
        </Text>
      </View>
    );
  };

  const toggleSection = (section) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFB400" />
        <Text style={styles.loadingText}>Đang tải lịch sử giao dịch...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={[
          styles.accordionHeader,
          expandedSection === "TOPUP" && styles.accordionHeaderExpanded,
        ]}
        onPress={() => toggleSection("TOPUP")}
      >
        <Text style={styles.accordionTitle}>Nạp tiền</Text>
        <Text style={styles.accordionCount}>
          {groupedTransactions.topups.length} giao dịch
        </Text>
      </TouchableOpacity>
      {expandedSection === "TOPUP" &&
        groupedTransactions.topups.map((item) => renderTransactionItem(item))}

      <TouchableOpacity
        style={[
          styles.accordionHeader,
          expandedSection === "WITHDRAW" && styles.accordionHeaderExpanded,
        ]}
        onPress={() => toggleSection("WITHDRAW")}
      >
        <Text style={styles.accordionTitle}>Rút tiền</Text>
        <Text style={styles.accordionCount}>
          {groupedTransactions.withdraws.length} giao dịch
        </Text>
      </TouchableOpacity>
      {expandedSection === "WITHDRAW" &&
        groupedTransactions.withdraws.map((item) =>
          renderTransactionItem(item)
        )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#F4F6F8",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 20,
    textAlign: "center",
  },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  accordionHeaderExpanded: {
    backgroundColor: "#FFF6E1",
    borderColor: "#FFB400",
  },
  accordionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  accordionCount: {
    fontSize: 16,
    color: "#888888",
  },
  transactionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  transactionOrderCode: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333333",
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  transactionStatus: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  success: {
    color: "#4CAF50",
  },
  failed: {
    color: "#F44336",
  },
  transactionDate: {
    fontSize: 12,
    color: "#AAAAAA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#777777",
  },
  success: {
    color: "#4CAF50", // Xanh lá
  },
  failed: {
    color: "#F44336", // Đỏ
  },
  cancelled: {
    color: "#FF9800", // Cam
  },
  pending: {
    color: "#FFC107", // Vàng
  },
  processing: {
    color: "#2196F3", // Xanh dương
  },
});

export default TransactionHistoryScreen;

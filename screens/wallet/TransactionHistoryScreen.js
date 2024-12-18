import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import axios from "axios";
import { IP_ADDRESS } from "@env";
import { useAuth } from "../../provider/AuthProvider";

const TransactionHistoryScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);
  const { authState } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingSection, setIsLoadingSection] = useState(null);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(
        `https://flexiride.onrender.com/driver/wallet/${authState.userId}/transactions`,
        {
          headers: {
            Authorization: `Bearer ${authState.token}`, // Truyền token vào header
          },
        }
      );
      if (response.data.success) {
        setTransactions(response.data.transactions);
      } else {
        Alert.alert("Lỗi", "Không thể lấy lịch sử giao dịch. ");
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
        statusText = "Đã thanh toán";
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
      case "APPROVED":
        statusText = "Đã duyệt";
        statusStyle = styles.cancelled;
        break;
      case "COMPLETED":
        statusText = "Đã hoàn thành";
        statusStyle = styles.success;
        break;
      default:
        statusText = "Trạng thái không xác định";
    }

    // Xác định dấu
    const amountPrefix = item.type === "TOPUP" ? "+" : "-";
    const formattedAmount = `${amountPrefix}${item.amount.toLocaleString(
      "vi-VN"
    )} ₫`;

    return (
      <View style={styles.transactionCard} key={item._id}>
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionAmount}>{formattedAmount}</Text>
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

  const toggleSection = async (section) => {
    if (expandedSection === section) {
      // Đóng accordion nếu đang mở
      setExpandedSection(null);
      return;
    }

    setIsLoadingSection(section);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setExpandedSection(section);
    } catch (error) {
      console.error("Error while toggling section:", error);
    } finally {
      setIsLoadingSection(null);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([fetchTransactions()]);
    } catch (error) {
      console.error("Error during refresh:", error);
    } finally {
      setIsRefreshing(false);
    }
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
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
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
        {isLoadingSection === "TOPUP" && (
          <ActivityIndicator
            size="small"
            color="#FFB400"
            style={{ marginLeft: 10 }}
          />
        )}
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
        {isLoadingSection === "WITHDRAW" && (
          <ActivityIndicator
            size="small"
            color="#FFB400"
            style={{ marginLeft: 10 }}
          />
        )}
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

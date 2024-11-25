import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { formatCurrency } from "../../utils/FormatPrice";
import axios from "axios";
import { IP_ADDRESS } from "@env";
import { useAuth } from "../../provider/AuthProvider";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Earnings = ({ navigation }) => {
  const { authState } = useAuth();

  const [earnings, setEarnings] = useState({
    today: {},
    yesterday: {},
    week: {},
    month: {},
  });
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalTrips: 0,
  });

  useEffect(() => {
    console.log("", IP_ADDRESS);

    fetchAllEarnings();
    fetchSummary();
  }, []);
  const fetchSummary = async () => {
    try {
      const response = await axios.get(
        `http://${IP_ADDRESS}:3000/payment-history/income/summary/${authState.userId}`
      );

      const { totalIncome, totalTrips } = response.data;
      setSummary({ totalIncome, totalTrips });
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  const fetchAllEarnings = async () => {
    try {
      const response = await axios.get(
        `http://${IP_ADDRESS}:3000/payment-history/income/all/${authState.userId}`
      );

      // Lưu kết quả vào state
      const data = response.data;
      console.log("🚀 ~ fetchAllEarnings ~ response.data:", response.data);
      setEarnings(data);
    } catch (error) {
      console.error("Error fetching earnings for all timeframes:", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.timeframeScrollContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {["today", "yesterday", "week", "month"].map((timeframe) => (
            <TouchableOpacity
              key={timeframe}
              style={styles.timeframeCard}
              onPress={() =>
                navigation.navigate("EarningsDetailScreen", {
                  timeframe,
                  driverId: authState.userId,
                })
              }
            >
              <Text style={styles.cardTitle}>
                {timeframe === "today"
                  ? "Hôm nay"
                  : timeframe === "yesterday"
                  ? "Hôm qua"
                  : timeframe === "week"
                  ? "Tuần này"
                  : "Tháng này"}
              </Text>
              <Text style={styles.cardValue}>
                {formatCurrency(earnings[timeframe]?.driverIncome || 0)}
              </Text>
              <Text style={styles.cardJobs}>
                {earnings[timeframe]?.totalTrips || 0} cuốc xe
              </Text>
              <Text style={styles.cardDetail}>Xem chi tiết</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <TouchableOpacity
        style={styles.summary}
        onPress={() => navigation.navigate("EarningsHistoryScreen")}
      >
        <Text style={styles.earningsText}>Tổng thu nhập:</Text>
        <Text style={styles.earningsValue}>
          {formatCurrency(summary.totalIncome || 0)}
        </Text>
        <Text style={styles.jobsText}>
          {summary.totalTrips || 0} cuốc xe đã hoàn thành
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 20,
  },
  summary: {
    marginBottom: 20,
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 8,
  },
  earningsText: {
    color: "#FFC107",
    fontSize: 20,
    fontWeight: "600",
  },
  earningsValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginVertical: 5,
  },
  jobsText: {
    color: "#fff",
    fontSize: 16,
  },

  timeframeScrollContainer: {
    marginBottom: 20,
  },
  timeframeCard: {
    width: 250,
    marginRight: 10,
    padding: 15,
    borderRadius: 10,
    alignItems: "left",
    justifyContent: "center",
    backgroundColor: "#333", // Màu nền
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    position: "relative", // Để chứa vị trí tuyệt đối của cardJobs
  },

  selectedCard: {
    backgroundColor: "#ccc", // Màu nổi bật khi chọn
  },
  cardTitle: {
    fontSize: 16,
    color: "#FFC107",
    marginBottom: 5,
    fontWeight: "600",
  },
  cardValue: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#fff",
    marginVertical: 10,
  },
  cardJobs: {
    position: "absolute", // Vị trí tuyệt đối
    top: 17, // Cách mép trên của card
    right: 10, // Cách mép phải của card
    fontSize: 12, // Giảm kích thước chữ
    color: "#fff", // Màu chữ
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Nền mờ
    paddingHorizontal: 8, // Khoảng cách ngang
    paddingVertical: 4, // Khoảng cách dọc
    borderRadius: 5, // Bo tròn góc
    overflow: "hidden", // Ẩn nội dung tràn
  },
  cardDetail: {
    fontSize: 12,
    color: "#ccc",
  },
});

export default Earnings;

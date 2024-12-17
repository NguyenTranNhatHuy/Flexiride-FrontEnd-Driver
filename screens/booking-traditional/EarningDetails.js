import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { formatCurrency } from "../../utils/FormatPrice";
import axios from "axios";
import { IP_ADDRESS } from "@env";
import { useRoute } from "@react-navigation/native";
import { useAuth } from "../../provider/AuthProvider";

const EarningsDetails = () => {
  const { authState } = useAuth();

  const route = useRoute();
  const { timeframe } = route.params;
  const driverId = authState.userId;
  const [earningsDetail, setEarningsDetail] = useState(null);

  useEffect(() => {
    fetchEarningsDetail();
  }, []);

  const fetchEarningsDetail = async () => {
    try {
      const response = await axios.get(
        `http://${IP_ADDRESS}:3000/payment-history/income/detail/${timeframe}/${driverId}`
      );
      setEarningsDetail(response.data);
    } catch (error) {
      console.error("Error fetching earnings detail:", error);
    }
  };

  if (!earningsDetail) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>
        {timeframe === "today"
          ? "Hôm nay"
          : timeframe === "yesterday"
          ? "Hôm qua"
          : timeframe === "week"
          ? "Tuần này"
          : "Tháng này"}
      </Text>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>Tổng thu nhập</Text>
        <Text style={styles.summaryValue}>
          {formatCurrency(earningsDetail.totalIncome || 0)}
        </Text>
        <Text style={styles.summaryJobs}>
          {earningsDetail.totalTrips || 0} cuốc xe hoàn thành
        </Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.detailHeader}>Danh sách chuyến đi:</Text>
        {earningsDetail.trips.length > 0 ? (
          earningsDetail.trips.map((trip, index) => (
            <View key={index} style={styles.tripCard}>
              <Text style={styles.tripText}>
                <Text style={styles.label}>Điểm đón: </Text>
                {trip.pickupLocation}
              </Text>
              <Text style={styles.tripText}>
                <Text style={styles.label}>Điểm đến: </Text>
                {trip.destinationLocation}
              </Text>
              <Text style={styles.tripText}>
                <Text style={styles.label}>Phương thức thanh toán: </Text>
                {trip.paymentMethod === "cash"
                  ? "Tiền mặt"
                  : "Thanh toán online"}
              </Text>
              <Text style={styles.tripText}>
                <Text style={styles.label}>Thu nhập ròng: </Text>
                {formatCurrency(trip.amount)}
              </Text>
              <Text style={styles.tripText}>
                <Text style={styles.label}>Ngày: </Text>
                {trip.date}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noTripsText}>Không có chuyến đi nào</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  summary: {
    backgroundColor: "#4CAF50",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  summaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginVertical: 10,
  },
  summaryJobs: {
    color: "#fff",
    fontSize: 16,
  },
  details: {
    backgroundColor: "#333",
    padding: 20,
    borderRadius: 10,
  },
  detailHeader: {
    color: "#FFC107",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  tripCard: {
    backgroundColor: "#444",
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
  },
  tripText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 5,
  },
  label: {
    fontWeight: "bold",
    color: "#FFC107",
  },
  noTripsText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
  },
});

export default EarningsDetails;

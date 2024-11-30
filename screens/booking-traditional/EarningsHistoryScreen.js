import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { formatCurrency } from "../../utils/FormatPrice";
import axios from "axios";
import { IP_ADDRESS } from "@env";
import { useAuth } from "../../provider/AuthProvider";
import { Ionicons } from "@expo/vector-icons";

const EarningsHistoryScreen = ({ navigation }) => {
  const { authState } = useAuth();
  const [selectedDate, setSelectedDate] = useState(null);
  const [earningsDetail, setEarningsDetail] = useState(null);

  useEffect(() => {
    console.log("", IP_ADDRESS);

    if (selectedDate) {
      fetchEarningsDetail();
    }
  }, [selectedDate]);

  const fetchEarningsDetail = async () => {
    try {
      const response = await axios.get(
        `https://flexiride.onrender.com/payment-history/income/detail/date/${selectedDate}/${authState.userId}`
      );
      setEarningsDetail(response.data);
    } catch (error) {
      console.error("Error fetching earnings detail:", error);
    }
  };

  const renderTrip = (trip, index) => (
    <View key={index} style={styles.tripContainer}>
      <View style={styles.tripHeader}>
        <Text style={styles.tripTime}>{trip.date}</Text>
        <Text style={styles.tripAmount}>
          {formatCurrency(trip.amount || 0)}
        </Text>
      </View>
      <Text style={styles.tripLocation}>
        {trip.pickupLocation} → {trip.destinationLocation}
      </Text>
      <View style={styles.paymentMethodContainer}>
        <Text style={styles.paymentMethod}>{trip.paymentMethod}</Text>
        {trip.isPromotion && (
          <Text style={styles.promotionLabel}>Khuyến mãi</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: {
            selected: true,
            marked: true,
            selectedColor: "#FFC107",
          },
        }}
        theme={{
          calendarBackground: "#121212",
          textSectionTitleColor: "#ffffff",
          selectedDayBackgroundColor: "#FFC107",
          selectedDayTextColor: "#000000",
          todayTextColor: "#4CAF50",
          dayTextColor: "#ffffff",
          arrowColor: "#FFC107",
          monthTextColor: "#ffffff",
          textDayFontWeight: "300",
          textMonthFontWeight: "bold",
          textDayHeaderFontWeight: "500",
        }}
      />
      {earningsDetail ? (
        <>
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Thu nhập ròng</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(earningsDetail.totalIncome || 0)}
            </Text>
            <Text style={styles.summaryTrips}>
              Hoàn tất {earningsDetail.totalTrips || 0} cuốc xe
            </Text>
          </View>
          <ScrollView style={styles.tripsList}>
            {earningsDetail.trips.map((trip, index) => renderTrip(trip, index))}
          </ScrollView>
        </>
      ) : (
        <Text style={styles.loadingText}>
          Vui lòng chọn ngày để xem chi tiết.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 10,
  },
  summary: {
    backgroundColor: "#333",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  summaryTitle: {
    color: "#FFC107",
    fontSize: 15,
    fontWeight: "bold",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginVertical: 10,
  },
  summaryTrips: {
    color: "#fff",
    fontSize: 14,
  },
  tripsList: {
    marginTop: 10,
  },
  tripContainer: {
    backgroundColor: "#1E1E1E",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  tripTime: {
    color: "#AAA",
    fontSize: 14,
  },
  tripAmount: {
    color: "#4CAF50",
    fontWeight: "bold",
    fontSize: 16,
  },
  tripLocation: {
    color: "#FFF",
    fontSize: 14,
    marginBottom: 5,
  },
  paymentMethodContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentMethod: {
    color: "#FFF",
    fontSize: 14,
  },
  promotionLabel: {
    marginLeft: 10,
    backgroundColor: "#FFC107",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
    color: "#000",
    fontSize: 12,
    fontWeight: "bold",
  },
  loadingText: {
    color: "#FFF",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});

export default EarningsHistoryScreen;

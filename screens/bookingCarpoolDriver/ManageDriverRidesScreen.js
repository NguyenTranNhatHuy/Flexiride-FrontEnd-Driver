// screens/ManageDriverRidesScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { getDriverRides } from "../../service/BookingCarpoolApi";
import { useAuth } from "../../provider/AuthProvider";
import { useFocusEffect } from "@react-navigation/native"; // Import useFocusEffect

export const ManageDriverRidesScreen = ({ navigation }) => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const { authState, logout } = useAuth();

  useFocusEffect(
    React.useCallback(() => {
      fetchRides();
    }, [])
  );

  const fetchRides = async () => {
    setLoading(true);
    try {
      const response = await getDriverRides(authState.token);
      setRides(response.data);
    } catch (error) {
      console.error("Error fetching driver rides:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN");
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case "pending":
        return "#FF6F00"; // Darker yellow for pending
      case "accepted":
        return "#388E3C"; // Dark green for accepted
      case "completed":
        return "#1976D2"; // Dark blue for completed
      case "canceled":
        return "#D32F2F"; // Dark red for canceled
      case "ongoing":
        return "#F57C00"; // Dark amber for ongoing
      default:
        return "#757575"; // Grey for unknown status
    }
  };

  const handleCardPress = (ride) => {
    // Navigate to "PickupProgress" and pass the ride data
    navigation.navigate("PickupProgress", { rideInfor: ride });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading your rides...</Text>
      </View>
    );
  }

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Đang chờ";
      case "accepted":
        return "Đã chấp nhận";
      case "completed":
        return "Đã hoàn thành";
      case "ongoing":
        return "Đang di chuyển";
      case "done":
        return "Đã đánh giá";
      default:
        return "Trạng thái không xác định";
    }
  };

  return (
    <View style={styles.container}>
      {rides.length === 0 ? (
        <Text style={styles.noRidesText}>Bạn không có yêu cầu nào.</Text>
      ) : (
        <FlatList
          data={rides}
          keyExtractor={(item, index) =>
            item._id ? item._id : index.toString()
          }
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleCardPress(item)}>
              <View
                style={[
                  styles.card,
                  { borderColor: getStatusTextColor(item.status) },
                ]}
              >
                <Text style={styles.rideInfo}>
                  Đi từ:{" "}
                  <Text style={styles.highlightText}>
                    {item.start_location}
                  </Text>
                </Text>
                <Text style={styles.rideInfo}>
                  Đến:{" "}
                  <Text style={styles.highlightText}>{item.end_location}</Text>
                </Text>
                <Text style={styles.rideInfo}>
                  Ngày Xuất phát:{" "}
                  <Text style={styles.highlightText}>
                    {formatDate(item.date)}
                  </Text>
                </Text>
                <Text style={styles.rideInfo}>
                  Thời gian xuất phát:{" "}
                  <Text style={styles.highlightText}>{item.time_start}</Text>
                </Text>
                <Text style={styles.rideInfo}>
                  Giá:{" "}
                  <Text style={styles.priceText}>
                    {formatPrice(item.price)} VNĐ
                  </Text>
                </Text>
                <Text
                  style={[
                    styles.rideInfo,
                    { color: getStatusTextColor(item.status) },
                  ]}
                >
                  Trạng thái: {getStatusText(item.status)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f0f8ff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  noRidesText: {
    textAlign: "center",
    fontSize: 16,
    color: "#999",
    marginTop: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
  },
  rideInfo: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  highlightText: {
    color: "#2196F3",
    fontWeight: "bold",
  },
  priceText: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
});

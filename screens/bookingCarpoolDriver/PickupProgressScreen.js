import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import * as Location from "expo-location";
import {
  updatePickupProgress,
  getCustomerStatusPickup,
  updateStartStatusRequest,
  updateCompleteStatusRequest,
} from "../../service/BookingCarpoolApi";
import { VIETMAP_API_KEY } from "@env";
import { useAuth } from "../../provider/AuthProvider";

export const PickupProgressScreen = ({ route, navigation }) => {
  const { rideInfor } = route.params;
  const [loading, setLoading] = useState(false);
  const [rides, setRides] = useState([]);
  const [rideStatus, setRideStatus] = useState(rideInfor.status);
  const driverLocation = { latitude: 15.975, longitude: 108.253 };
  const { authState, logout } = useAuth();

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    setLoading(true);
    try {
      const response = await getCustomerStatusPickup(
        rideInfor._id,
        authState.token
      );
      setRides(response.data.list_customer);
    } catch (error) {
      console.error("Error fetching driver rides:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerCoordinates = async (address) => {
    console.log("================search======================");
    const url = `https://maps.vietmap.vn/api/search/v3?apikey=${VIETMAP_API_KEY}&focus=10.75887508,106.67538868&text=Công Ty Cổ Phần Ứng Dụng Bản Đồ Việt,HCM`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log("serach: ", data);

      if (data.length > 0) {
        return {
          latitude: data[0].location.lat,
          longitude: data[0].location.lng,
        };
      }
    } catch (error) {
      console.error("Error fetching coordinates from address:", error);
    }
    return null;
  };

  const handlePickupCustomer = (customerId) => {
    updatePickupProgress(rideInfor._id, customerId, authState.token)
      .then(() => {
        // alert('Đã cập nhật trạng thái đón khách!');
        setRides((prevRides) =>
          prevRides.map((customer) =>
            customer.account_id._id === customerId
              ? { ...customer, pickedUp: true }
              : customer
          )
        );
      })
      .catch((err) => console.log(err));
  };

  const handleStartTrip = () => {
    updateStartStatusRequest(rideInfor._id, authState.token)
      .then(() => {
        setRideStatus("ongoing");
      })
      .catch((err) => {
        console.log(err);
        alert("Có lỗi xảy ra khi bắt đầu chuyến xe. Vui lòng thử lại!");
      });
  };

  const handleCompleteTrip = () => {
    console.log("===========start=================");

    updateCompleteStatusRequest(rideInfor._id, authState.token)
      .then(() => {
        setRideStatus("completed");
        console.log("===========finish=================");
        fetchRides();
      })
      .catch((err) => {
        console.log(err);
        alert("Có lỗi xảy ra khi kết thúc chuyến xe. Vui lòng thử lại!");
      });
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("vi-VN");
  const formatTime = (timeString) =>
    new Date(timeString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  const formatPrice = (price) => price.toLocaleString("vi-VN");

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading ride details...</Text>
      </View>
    );
  }

  const handleCardPress = (ride) => {
    // const driverLocation = { latitude: 15.975, longitude: 108.253 }; // Vị trí tài xế (cố định)

    // Chuẩn bị danh sách điểm đón từ pickup_location
    const pickupPoints = ride.pickup_location.map((point) => ({
      latitude: parseFloat(point.latitude),
      longitude: parseFloat(point.longitude),
    }));

    // Điều hướng đến màn hình OptimalRoute
    navigation.navigate("OptimalRoute", {
      driverLocation,
      pickupPoints,
    });
  };

  const handleNavigate = async (customer) => {
    const customerCoordinates = {
      latitude: parseFloat(customer.latitude),
      longitude: parseFloat(customer.longitude),
    };

    const driverCoordinates = {
      latitude: 15.975, // Vị trí tài xế (set cứng hoặc lấy từ GPS)
      longitude: 108.253,
    };

    // Điều hướng đến màn hình chỉ đường
    navigation.navigate("SingleRoute", {
      driverCoordinates,
      customerCoordinates,
    });
  };

  // Hàm gọi điện thoại
  const handleCallCustomer = (phoneNumber) => {
    // Loại bỏ tất cả ký tự không phải số (bao gồm dấu cách, dấu -)
    const cleanedPhoneNumber = phoneNumber.replace(/[^0-9+]/g, "");

    console.log("Số điện thoại sau khi làm sạch: ", cleanedPhoneNumber);

    // Kiểm tra nếu số điện thoại bắt đầu bằng "+" (mã quốc gia), nếu không thì thêm "+84" (mã quốc gia Việt Nam)
    const phoneUrl = `tel:+840123456789`;

    Linking.openURL(phoneUrl)
      .then(() => console.log("Đang gọi điện"))
      .catch((err) => {
        console.error("Lỗi khi gọi điện:", err);
        alert("Không thể gọi điện tới số này");
      });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "#FF9800"; // Orange
      case "ongoing":
        return "#2196F3"; // Blue
      case "completed":
        return "#4CAF50"; // Green
      case "rejected":
        return "#F44336"; // Red
      case "pending":
        return "#9E9E9E"; // Gray
      default:
        return "#000"; // Black for unknown status
    }
  };

  const rideStatusMap = {
    pending: "Đang chờ",
    accepted: "Đã chấp nhận",
    ongoing: "Đang đi",
    completed: "Đã hoàn thành",
    done: "Đã đánh giá",
  };

  const getCardBackgroundColor = (status) => {
    switch (status) {
      case "pending":
        return "#FFFFFF"; // Trắng nhạt
      case "accepted":
        return "#DFF2E1"; // Xanh lá nhạt
      case "completed":
        return "#FDECEA"; // Đỏ nhạt
      case "ongoing":
        return "#FFF8E1"; // Vàng nhạt
      case "done":
        return "#E3F2FD"; // Xanh dương nhạt
      default:
        return "#FFFFFF"; // Mặc định là trắng nhạt
    }
  };

  const getPickupBackgroundColor = (status) => {
    switch (status) {
      case true:
        return "#E3F2FD"; // Trắng nhạt
      case false:
        return "#bce6c8"; // Xanh lá nhạt
      default:
        return "#E3F2FD"; // Mặc định là trắng nhạt
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: getCardBackgroundColor(rideStatus) },
      ]}
    >
      <View style={styles.rideDetails}>
        <View style={styles.detailContainer}>
          <View style={styles.infoContainer}>
            <Text style={styles.detailText}>
              Đi từ:{" "}
              <Text style={styles.highlightText}>
                {rideInfor.start_location}
              </Text>
            </Text>
            <Text style={styles.detailText}>
              Đến:{" "}
              <Text style={styles.highlightText}>{rideInfor.end_location}</Text>
            </Text>
            <Text style={styles.detailText}>
              Ngày:{" "}
              <Text style={styles.highlightText}>
                {formatDate(rideInfor.date)}
              </Text>
            </Text>
            <Text style={styles.detailText}>
              Thời gian:{" "}
              <Text style={styles.highlightText}>{rideInfor.time_start}</Text>
            </Text>
            <Text style={styles.detailText}>
              Giá:{" "}
              <Text style={styles.priceText}>
                {formatPrice(rideInfor.price)} VNĐ
              </Text>
            </Text>
            <Text style={styles.detailText}>
              Trạng thái:{" "}
              <Text
                style={[
                  styles.highlightText,
                  { color: getStatusColor(rideStatus) },
                ]}
              >
                {rideStatusMap[rideStatus] || "Không xác định"}
              </Text>
            </Text>
          </View>
          {rideStatus != "completed" && (
            <TouchableOpacity
              style={styles.routeButton}
              onPress={() => handleCardPress(rideInfor)}
            >
              <Text style={styles.buttonText}>Lộ trình</Text>
            </TouchableOpacity>
          )}
          {rideStatus === "completed" && (
            <TouchableOpacity
              style={styles.routeButton}
              onPress={() => navigation.navigate("ManageDriverRides")}
            >
              <Text style={styles.buttonText}>Trở lại</Text>
            </TouchableOpacity>
          )}
        </View>
        {rideStatus === "accepted" && (
          <TouchableOpacity
            style={styles.navigateButton}
            onPress={handleStartTrip}
          >
            <Text style={styles.buttonText}>Bắt đầu</Text>
          </TouchableOpacity>
        )}
        {rideStatus === "ongoing" && (
          <TouchableOpacity
            style={styles.navigateButton}
            onPress={handleCompleteTrip}
          >
            <Text style={styles.buttonText}>Hoàn thành</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={rides || []}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              { backgroundColor: getPickupBackgroundColor(item.pickedUp) },
            ]}
          >
            <Text style={styles.customerInfo}>
              Khách:{" "}
              <Text style={styles.highlightText}>{item.account_id.name}</Text>
            </Text>
            <Text style={styles.customerInfo}>
              Số điện thoại:{" "}
              <Text style={styles.highlightText}>{item.account_id.phone}</Text>
            </Text>
            <Text style={styles.customerInfo}>
              Địa chỉ: <Text style={styles.highlightText}>{item.location}</Text>
            </Text>
            <Text style={styles.customerInfo}>
              Số tiền cần trả:
              <Text style={styles.priceText}>
                {formatPrice(Math.round(rideInfor.price / rides.length))} VNĐ
              </Text>
            </Text>
            <Text style={styles.statusText}>
              Trạng thái:
              <Text style={{ color: item.pickedUp ? "#4CAF50" : "#F44336" }}>
                {item.pickedUp ? " Đã đón" : " Chưa đón"}
              </Text>
            </Text>
            {rideStatus !== "completed" && !item.pickedUp && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.pickupButton}
                  onPress={() => handlePickupCustomer(item.account_id._id)}
                >
                  <Text style={styles.buttonText}>Đã đón</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.navigateButton}
                  onPress={() => handleNavigate(item)}
                >
                  <Text style={styles.buttonText}>Chỉ đường</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.navigateButton}
                  onPress={() => handleCallCustomer(item.account_id.phone)}
                >
                  <Text style={styles.buttonText}>Gọi</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f0f8ff",
  },
  rideDetails: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    height: 300,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  detailContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10, // Khoảng cách giữa thông tin và nút bên dưới
  },
  infoContainer: {
    flex: 1,
    marginRight: 10, // Khoảng cách giữa thông tin và nút
  },
  routeButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
    height: 60,
    width: 200,
    justifyContent: "center",
    flex: 0.3, // Nút chiếm không gian nhỏ hơn thông tin
  },
  navigateButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10, // Khoảng cách giữa nút này và phần trên
    alignItems: "center",
  },

  detailText: {
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
    borderColor: "#2196F3",
  },
  customerInfo: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  statusText: {
    fontSize: 16,
    marginBottom: 10,
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row", // Đảm bảo các nút nằm trên 1 hàng ngang
    justifyContent: "space-between", // Tùy chọn: sắp xếp các nút đều nhau, hoặc 'center' để căn giữa
    alignItems: "center", // Căn chỉnh các nút theo chiều dọc
  },
  pickupButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    borderRadius: 5,
    flex: 1, // Mỗi nút chiếm một phần không gian bằng nhau
    marginRight: 5, // Khoảng cách giữa các nút
    alignItems: "center",
  },
  navigateButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    borderRadius: 5,
    flex: 1, // Mỗi nút chiếm một phần không gian bằng nhau
    marginRight: 5, // Khoảng cách giữa các nút
    alignItems: "center",
  },
  callButton: {
    backgroundColor: "#FF5722", // Màu cho nút "Gọi"
    paddingVertical: 10,
    borderRadius: 5,
    flex: 1, // Mỗi nút chiếm một phần không gian bằng nhau
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
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
});

export default PickupProgressScreen;

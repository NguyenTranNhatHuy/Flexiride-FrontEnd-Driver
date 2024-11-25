import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import LocationContext from "../provider/LocationCurrentProvider";
import io from "socket.io-client";
import { formatCurrency } from "../utils/FormatPrice";
import axios from "axios";
import { IP_ADDRESS } from "@env";

const DriverScreen = ({ navigation }) => {
  const { location, loading, error } = useContext(LocationContext);

  const [isOnline, setIsOnline] = useState(false);
  const [rideRequest, setRideRequest] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [requestTimeout, setRequestTimeout] = useState(null);
  const [distanceToPickup, setDistanceToPickup] = useState(null);
  const [serviceName, setServiceName] = useState(null);
  const [request, setRequest] = useState(null);

  const [showMissedScreen, setShowMissedScreen] = useState(false);
  const socket = useRef(null);

  useEffect(() => {
    if (!socket.current) {
      socket.current = io(`http://${IP_ADDRESS}:3000`, {
        transports: ["websocket"],
      });
      console.log("connected");
      socket.current.on("connect", () => {
        if (isOnline && location && location.latitude && location.longitude) {
          socket.current.emit("driverOnline", {
            id: "673d6d13bb1637c5e099e488",
            location: {
              lat: location.latitude,
              lng: location.longitude,
            },
            serviceType: "6713ed463526cf13c53cb3bd",
          });
        }
      });
      // socket.current.on("requestExpired", (data) => {
      //   // Kiểm tra để đảm bảo `rideRequest` và `data.requestId` khớp
      //   if (!rideRequest || rideRequest.requestId !== data.requestId) return;
      //   setModalVisible(false);
      //   setRideRequest(null);
      //   setDistanceToPickup(null);
      //   Alert.alert("Yêu cầu đã hết hạn", "Yêu cầu này không còn khả dụng.");
      // });

      socket.current.on("disconnect", () => {
        setIsOnline(false);
        setModalVisible(false);
      });

      // Nhận yêu cầu đặt xe
      socket.current.on("newRideRequest", (request) => {
        setRideRequest(request);
        setModalVisible(true);

        if (location && location.latitude && location.longitude) {
          const distance = calculateDistance(
            location.latitude,
            location.longitude,
            request.pickupLocation.latitude,
            request.pickupLocation.longitude
          );
          setDistanceToPickup(distance);
        } else {
          setDistanceToPickup("N/A");
        }
        fetchServiceName(request.serviceId);
        // fetchRequestDetail(request.requestId);

        const timeout = setTimeout(() => {
          if (modalVisible) {
            handleMissedRequest();
            socket.current.emit("bookingRequestExpired", {
              bookingRequestId: request.requestId,
            });
          }
        }, 15000);
        setRequestTimeout(timeout);
      });
    }

    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
      if (requestTimeout) clearTimeout(requestTimeout);
    };
  }, []);
  useEffect(() => {
    socket.current.on("requestExpired", (data) => {
      // Kiểm tra để đảm bảo `rideRequest` và `data.requestId` khớp
      if (rideRequest && rideRequest.requestId === data.requestId) {
        setModalVisible(false); // Ẩn modal yêu cầu
        setRideRequest(null);
        setDistanceToPickup(null);
        setShowMissedScreen(true); // Hiển thị modal "Trôi Cuốc"
      }
    });

    return () => {
      socket.current.off("requestExpired");
    };
  }, [rideRequest]);

  const handleMissedRequest = () => {
    // Tắt trạng thái hoạt động của tài xế
    setIsOnline(false);
    setModalVisible(false);
    setRideRequest(null);

    // Hiển thị màn hình "Trôi Cuốc"
    setShowMissedScreen(true);
  };
  useEffect(() => {
    if (socket.current && isOnline && location) {
      socket.current.emit("driverOnline", {
        id: "673d6d13bb1637c5e099e488",
        location: {
          lat: location.latitude,
          lng: location.longitude,
        },
        serviceType: "6713ed463526cf13c53cb3bd",
      });
    } else if (socket.current && !isOnline) {
      socket.current.emit("driverOffline", { id: "673d6d13bb1637c5e099e488" });
    }
  }, [isOnline, location]);

  const handleGoOnline = () => {
    if (location) {
      setIsOnline(true);
    } else {
      Alert.alert(
        "Vị trí không khả dụng",
        "Không thể bật kết nối nếu không có vị trí."
      );
    }
  };

  const handleGoOffline = () => {
    setIsOnline(false);
    if (socket.current) {
      socket.current.emit("driverOffline", { id: "673d6d13bb1637c5e099e488" });
    }
  };

  const handleAcceptRequest = () => {
    if (socket.current && rideRequest) {
      socket.current.emit("acceptRide", {
        requestId: rideRequest.requestId,
        driverId: "673d6d13bb1637c5e099e488",
        customerId: rideRequest.customerId,
      });

      // Ẩn modal và ngăn handleMissedRequest chạy
      setModalVisible(false);

      // Xóa thời gian chờ
      clearTimeout(requestTimeout);
      setRideRequest(null);
      setDistanceToPickup(null);
      setRequestTimeout(null);

      Alert.alert(
        "Đã chấp nhận yêu cầu!",
        "Bạn đã nhận chuyến của khách hàng."
      );

      // Truyền bookingDetails sang BookingTraditional
      navigation.navigate("BookingTraditional", {
        bookingDetails: {
          requestId: rideRequest.requestId,
          customerId: rideRequest.customerId,
          pickupLocation: rideRequest.pickupLocation,
          destinationLocation: rideRequest.destinationLocation,
          customerAddress: rideRequest.pickupLocation.address,
          fare: rideRequest.price,
          paymentMethod: rideRequest.paymentMethod,
          serviceName: serviceName,
          moment_book: rideRequest.moment_book,
          status: rideRequest.status,
        },
      });
    }
  };

  const backOnline = () => {
    setIsOnline(true);
    setShowMissedScreen(false);
  };

  const handleDeclineRequest = () => {
    setModalVisible(false);
    setRideRequest(null);
    setDistanceToPickup(null);
    clearTimeout(requestTimeout);
  };
  const fetchServiceName = async (serviceId) => {
    try {
      const response = await axios.get(
        `http://${IP_ADDRESS}:3000/booking-traditional/vehicle/${serviceId}`
      );
      setServiceName(response.data.name);
    } catch (error) {
      console.error("Error fetching service name:", error);
      setServiceName("Unknown Service");
    }
  };
  const fetchRequestDetail = async (requestId) => {
    try {
      const response = await axios.get(
        `http://${IP_ADDRESS}:3000/booking-traditional/request/${requestId}`
      );
      setRequest(response.data);
    } catch (error) {
      console.error("Error fetching service name:", error);
      setServiceName("Unknown Service");
    }
  };
  function calculateDistance(lat1, lon1, lat2, lon2) {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
      return "N/A"; // Trả về "N/A" nếu thiếu dữ liệu
    }
    const R = 6371; // Radius of the earth in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance.toFixed(1); // Round to 1 decimal place
  }

  function toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  return (
    <View style={styles.container}>
      {location ? (
        <MapView style={styles.map} initialRegion={location}>
          <Marker coordinate={location}>
            <View style={{ width: 35, height: 35 }}>
              <Ionicons name="navigate-circle" size={35} color="blue" />
            </View>
          </Marker>
        </MapView>
      ) : (
        <Text>Đang lấy vị trí...</Text>
      )}
      <TouchableOpacity style={styles.earningsButton}>
        <Ionicons name="stats-chart" size={24} color="black" />
        <Text style={styles.earningsText}>Thu nhập</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.profileButton}>
        <Ionicons name="person-circle-outline" size={50} color="black" />
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>5.0</Text>
        </View>
      </TouchableOpacity>
      {!isOnline ? (
        <TouchableOpacity
          style={styles.goOnlineButton}
          onPress={handleGoOnline}
        >
          <Ionicons name="power-outline" size={24} color="black" />
          <Text style={styles.goOnlineText}>Bật kết nối</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.goOnlineButton}
          onPress={handleGoOffline}
        >
          <Ionicons name="power-outline" size={24} color="black" />
          <Text style={styles.goOnlineText}>Ngắt kết nối</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.statusNoti}>
        <Text style={styles.goOnlineText}>
          {isOnline ? "Bạn đang online" : "Bạn đang offline"}
        </Text>
      </TouchableOpacity>
      <View style={styles.bottomControl}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bottomButtons}
        >
          <TouchableOpacity style={styles.serviceButton}>
            <Ionicons name="car-outline" size={24} color="black" />
            <Text style={styles.serviceText}>Loại dịch vụ</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.serviceButton}>
            <Ionicons name="location-outline" size={24} color="black" />
            <Text style={styles.serviceText}>Điểm đến yêu thích</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.serviceButton}>
            <Ionicons name="briefcase-outline" size={24} color="black" />
            <Text style={styles.serviceText}>Tiền vốn hoạt động</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.serviceButton}>
            <Ionicons name="flash-outline" size={24} color="black" />
            <Text style={styles.serviceText}>Tự động nhận</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.serviceButton}>
            <MaterialIcons name="more-horiz" size={24} color="black" />
            <Text style={styles.serviceText}>Xem thêm</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalDistance}>{serviceName}</Text>
            <Text style={styles.modalPaymentMethod}>
              Phương thức thanh toán:{" "}
              {rideRequest?.paymentMethod === "cash" ? "Tiền mặt" : "MoMo"}
            </Text>

            {/* Giá cước */}
            <Text style={styles.modalFare}>
              Giá cước: {formatCurrency(rideRequest?.price)}
            </Text>
            <Text style={styles.modalDistance}>
              Cách bạn {distanceToPickup} km
            </Text>

            <View style={styles.locationContainer}>
              {/* Điểm đón */}
              <View style={styles.locationRow}>
                <View style={styles.dotStart} />
                <View style={styles.locationTextContainer}>
                  <Text style={styles.locationTitle}>
                    {rideRequest?.pickupLocation?.name}
                  </Text>
                  <Text style={styles.locationAddress}>
                    {rideRequest?.pickupLocation?.address}
                  </Text>
                </View>
              </View>

              {/* Đường nối */}
              <View style={styles.lineConnector} />

              {/* Điểm đến */}
              <View style={styles.locationRow}>
                <View style={styles.dotEnd} />
                <View style={styles.locationTextContainer}>
                  <Text style={styles.locationTitle}>
                    {rideRequest?.destinationLocation?.name}
                  </Text>
                  <Text style={styles.locationAddress}>
                    {rideRequest?.destinationLocation?.address}
                  </Text>
                </View>
              </View>
            </View>

            {/* Nút chấp nhận và từ chối */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={handleAcceptRequest}
              >
                <Text style={styles.buttonText}>Chấp nhận</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.declineButton}
                onPress={handleDeclineRequest}
              >
                <Text style={styles.buttonText}>Từ chối</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={showMissedScreen}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.missedScreenContainer}>
          <View style={styles.missedScreenContent}>
            <Text style={styles.title}>Trôi Cuốc</Text>
            <Text style={styles.message}>
              Việc từ chối cuốc xe có thể ảnh hưởng đến tỷ lệ nhận cuốc của bạn.
              Bạn đang ngoại tuyến, chọn trực tuyến để nhận cuốc.
            </Text>
            <TouchableOpacity
              style={styles.goOnlineButton2}
              onPress={backOnline}
            >
              <Text style={styles.goOnlineText2}>Sẵn sàng nhận cuốc</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  map: {
    flex: 1,
  },
  earningsButton: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  earningsText: {
    marginLeft: 5,
  },
  profileButton: {
    position: "absolute",
    top: 40,
    right: 20,
    alignItems: "center",
  },
  ratingContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FFC107",
    borderRadius: 50,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  ratingText: {
    color: "black",
    fontWeight: "bold",
  },
  goOnlineButton: {
    position: "absolute",
    bottom: 130,
    alignSelf: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  statusNoti: {
    position: "absolute",
    bottom: 75,
    alignSelf: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
    paddingHorizontal: 20,
    paddingVertical: 15,
    width: "100%",
  },
  goOnlineText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  bottomControl: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  bottomButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  serviceButton: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
  },
  serviceText: {
    color: "black",
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "90%",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalPaymentMethod: {
    fontSize: 16,
    color: "#6c757d",
    marginVertical: 5,
  },
  modalFare: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "bold",
    marginVertical: 5,
  },

  modalDistance: {
    fontSize: 16,
    color: "#6c757d",
    marginBottom: 10,
  },
  locationContainer: {
    width: "100%",
    marginVertical: 15,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  dotStart: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "green",
    marginRight: 10,
  },
  dotEnd: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "red",
    marginRight: 10,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  locationAddress: {
    fontSize: 14,
    color: "#555",
  },
  lineConnector: {
    width: 2,
    height: 20,
    backgroundColor: "#ddd",
    alignSelf: "center",
    marginVertical: 2,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  declineButton: {
    backgroundColor: "#f44336",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  missedScreenContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  missedScreenContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  goOnlineButton2: {
    backgroundColor: "#28a745",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  goOnlineText2: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default DriverScreen;

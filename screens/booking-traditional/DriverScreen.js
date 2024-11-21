import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import io from "socket.io-client";
import { formatCurrency } from "../../utils/FormatPrice";
import axios from "axios";
import { IP_ADDRESS, VIETMAP_API_KEY } from "@env";
import VietmapGL from "@vietmap/vietmap-gl-react-native"; // Import Vietmap

import useLocation from "../../hook/useLocation";

const DriverScreen = ({ navigation }) => {
  const { currentLocation } = useLocation();

  const [isOnline, setIsOnline] = useState(false);
  const [rideRequest, setRideRequest] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [distanceToPickup, setDistanceToPickup] = useState(null);
  const [serviceName, setServiceName] = useState(null);
  const [showMissedScreen, setShowMissedScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const socket = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (isOnline && currentLocation) {
      handleSocketConnect();
    }
  }, [isOnline, currentLocation]);

  useEffect(() => {
    console.log("IP_ADDRESS: " + IP_ADDRESS);

    if (!socket.current) {
      socket.current = io(`http://${IP_ADDRESS}:3000`, {
        transports: ["websocket"],
      });
      socket.current.on("connect", () => handleSocketConnect());
      socket.current.on("disconnect", handleSocketDisconnect);
      socket.current.on("newRideRequest", handleNewRideRequest);
    }

    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, []);

  const handleSocketConnect = () => {
    if (isOnline && currentLocation) {
      const driverData = {
        id: "673170d4b61da1537e89b5af",
        currentLocation: {
          lat: currentLocation.latitude,
          lng: currentLocation.longitude,
        },
        serviceType: "6713ed463526cf13c53cb3bd",
      };
      console.log("driverData being sent:", driverData);
      socket.current.emit("driverOnline", driverData);
    } else {
      // console.warn(
      //   "Cannot send driver online data, missing currentLocation or isOnline is false."
      // );
    }
  };

  const handleSocketDisconnect = () => {
    console.log("Socket disconnected, setting isOnline to false");
    setIsOnline(false);
    setModalVisible(false);
  };

  const handleNewRideRequest = (request) => {
    setRideRequest(request);
    setModalVisible(true);

    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      request.pickupLocation.latitude,
      request.pickupLocation.longitude
    );
    setDistanceToPickup(distance);
    fetchServiceName(request.serviceId);

    setTimeout(() => {
      if (modalVisible) {
        handleMissedRequest();
        socket.current.emit("bookingRequestExpired", {
          bookingRequestId: request.requestId,
        });
      }
    }, 15000);
  };

  const handleGoOnline = () => {
    if (currentLocation) {
      console.log("Going online with currentLocation:", currentLocation);
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
    socket.current?.emit("driverOffline", { id: "673170d4b61da1537e89b5af" });
  };

  const backOnline = () => {
    setIsOnline(true);
    setShowMissedScreen(false);
  };

  // 6. Xử lý yêu cầu đặt xe
  const handleAcceptRequest = () => {
    socket.current?.emit("acceptRide", {
      requestId: rideRequest.requestId,
      driverId: "673170d4b61da1537e89b5af",
      customerId: rideRequest.customerId,
    });
    console.log("rideRequest.moment_book: ", rideRequest.moment_book);
    setModalVisible(false);
    Alert.alert("Đã chấp nhận yêu cầu!", "Bạn đã nhận chuyến của khách hàng.");
    navigation.navigate("BookingTraditional", {
      bookingDetails: {
        ...rideRequest,
        serviceName,
        moment_book: rideRequest.moment_book,
        status: rideRequest.status,
      },
    });
  };

  const handleDeclineRequest = () => {
    setModalVisible(false);
    setRideRequest(null);
  };

  const handleMissedRequest = () => {
    setIsOnline(false);
    setModalVisible(false);
    setRideRequest(null);
    setShowMissedScreen(true);
  };

  // 7. Các hàm phụ trợ cho xử lý yêu cầu và tính toán khoảng cách
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

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return "N/A";
    const R = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  const toRadians = (degrees) => degrees * (Math.PI / 180);
  const currentLocationGeoJson = currentLocation
    ? {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [
                currentLocation.longitude,
                currentLocation.latitude,
              ],
            },
            properties: {
              name: "Current Location",
            },
          },
        ],
      }
    : null;
  return (
    <View style={styles.container}>
      {currentLocation ? (
        <VietmapGL.MapView
          ref={mapRef}
          style={{ flex: 1 }}
          styleURL={`https://maps.vietmap.vn/api/maps/light/styles.json?apikey=${VIETMAP_API_KEY}`}
        >
          <VietmapGL.Camera
            centerCoordinate={[
              currentLocation.longitude,
              currentLocation.latitude,
            ]}
            zoomLevel={13}
          />

          {currentLocationGeoJson && (
            <VietmapGL.ShapeSource
              id="currentLocation"
              shape={currentLocationGeoJson}
            >
              <VietmapGL.SymbolLayer
                id="currentLocationMarker"
                style={{
                  iconImage: require("../../assets/current-location.png"), // Đường dẫn biểu tượng tùy chỉnh
                  iconSize: 0.05, // Điều chỉnh kích thước biểu tượng
                  iconAllowOverlap: true, // Cho phép các biểu tượng chồng lên nhau
                }}
              />
            </VietmapGL.ShapeSource>
          )}
        </VietmapGL.MapView>
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
    bottom: 150,
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
    bottom: 85,
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

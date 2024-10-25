// DriverScreen.js
import React, { useState, useEffect } from "react";
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
import * as Location from "expo-location"; // Import expo-location
import io from "socket.io-client"; // Sử dụng socket.io-client chính thức

const DriverScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [socket, setSocket] = useState(null);
  const [rideRequest, setRideRequest] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Lấy vị trí hiện tại khi màn hình được tải
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        Alert.alert(
          "Quyền truy cập vị trí bị từ chối",
          "Ứng dụng cần quyền truy cập vị trí để lấy điểm hiện tại."
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    })();

    // Ngắt kết nối socket khi component bị unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const handleGoOnline = () => {
    if (location) {
      const newSocket = io("http://192.168.88.142:3000", {
        transports: ["websocket"],
      });
      setSocket(newSocket);
      console.log("Socket initialized");

      newSocket.on("connect", () => {
        setIsOnline(true);
        newSocket.emit("driverOnline", {
          id: "67151219bc3fc797c0ca5329",
          location: {
            lat: location.latitude,
            lng: location.longitude,
          },
        });
        console.log("Tài xế đã bật kết nối");
      });

      newSocket.on("disconnect", () => {
        setIsOnline(false);
        console.log("Đã ngắt kết nối từ server");
      });
      newSocket.on("newRideRequest", (request) => {
        setRideRequest(request);
        setModalVisible(true);
      });
      newSocket.on("connect_error", (err) => {
        console.log("Lỗi kết nối:", err.message);
        Alert.alert("Lỗi kết nối", "Không thể kết nối đến server.");
      });
    } else {
      Alert.alert(
        "Vị trí không khả dụng",
        "Không thể bật kết nối nếu không có vị trí."
      );
    }
  };

  const handleGoOffline = () => {
    if (socket) {
      // Gửi sự kiện tài xế offline
      socket.emit("driverOffline", { id: "67151219bc3fc797c0ca5329" });
      socket.disconnect(); // Ngắt kết nối khỏi server
      setIsOnline(false);
      console.log("Tài xế đã tắt kết nối");
    }
  };
  const handleAcceptRequest = () => {
    if (socket && rideRequest) {
      socket.emit("acceptRide", {
        driverId: "67151219bc3fc797c0ca5329",
        customerId: rideRequest.customerId,
      });
      setModalVisible(false);
      Alert.alert(
        "Đã chấp nhận yêu cầu!",
        `Bạn đã nhận chuyến của khách hàng.`
      );
    }
  };

  const handleDeclineRequest = () => {
    setModalVisible(false);
    setRideRequest(null); // Xóa yêu cầu khỏi trạng thái
  };
  return (
    <View style={styles.container}>
      {/* MapView */}
      {location ? (
        <MapView style={styles.map} initialRegion={location}>
          <Marker coordinate={location} />
        </MapView>
      ) : (
        <Text>Đang lấy vị trí...</Text>
      )}
      {/* Nút Earnings */}
      <TouchableOpacity style={styles.earningsButton}>
        <Ionicons name="stats-chart" size={24} color="black" />
        <Text style={styles.earningsText}>Thu nhập</Text>
      </TouchableOpacity>
      {/* Nút hình đại diện và rating */}
      <TouchableOpacity style={styles.profileButton}>
        <Ionicons name="person-circle-outline" size={50} color="black" />
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>5.0</Text>
        </View>
      </TouchableOpacity>
      {/* Nút bật/ngắt kết nối */}
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
      {/* Trạng thái tài xế */}
      <TouchableOpacity style={styles.statusNoti}>
        <Text style={styles.goOnlineText}>
          {isOnline ? "Bạn đang online" : "Bạn đang offline"}
        </Text>
      </TouchableOpacity>
      {/* Thanh điều khiển ở dưới */}
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
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Yêu cầu đặt xe</Text>
            {rideRequest ? (
              <>
                <Text>Điểm đón: {rideRequest.pickupLocation.address}</Text>
                <Text>Điểm đến: {rideRequest.destinationLocation.address}</Text>
                <View style={styles.modalButtons}>
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
              </>
            ) : (
              <ActivityIndicator size="large" color="#00ff00" />
            )}
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  modalButtons: { flexDirection: "row", marginTop: 20 },
  acceptButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  declineButton: {
    backgroundColor: "#f44336",
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  buttonText: { color: "white", fontWeight: "bold" },
});

export default DriverScreen;

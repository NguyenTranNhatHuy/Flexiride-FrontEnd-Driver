import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
  Image,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import polyline from "@mapbox/polyline";
import { formatCurrency } from "../utils/FormatPrice";
import { VIETMAP_API_KEY, IP_ADDRESS } from "@env";
import LocationContext from "../provider/LocationCurrentProvider";
// import Geolocation from "@react-native-community/geolocation";
import * as Location from "expo-location";
import SupportCenterModal from "./SupportCenterModal";

const BookingTraditional = ({ navigation, route }) => {
  // const { currentLocation } = useContext(LocationContext);
  const [currentLocation, setCurrentLocation] = useState(null);

  const bookingDetails = route.params?.bookingDetails || {
    requestId: "672cb454b77f15a602eb2eb6",
    customerId: "670bdfc8b65786a7225f39a1",
    moment_book: "2024-11-07T12:36:34.842+00:00",
    pickupLocation: {
      latitude: 15.863928919036544,
      longitude: 108.38814055354507,
      address: "Tạp hóa Tứ Vang",
    },
    destinationLocation: {
      latitude: 16.0544,
      longitude: 108.2022,
      address: "Hội An",
    },
    customerName: "Nguyễn Văn A",
    fare: 100000, // Giá giả định
    paymentMethod: "cash",
    serviceName: "Flexibike",
    customerId: "670bdfc8b65786a7225f39a1",
  };
  // const bookingDetails = route.params?.bookingDetails;
  const momentBook = bookingDetails?.moment_book;
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [request, setRequest] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [supportModalVisible, setSupportModalVisible] = useState(false);

  const pickupLocation = bookingDetails.pickupLocation;
  const destinationLocation = bookingDetails.destinationLocation;

  useEffect(() => {
    requestLocationPermission();
    fetchCustomerDetails(bookingDetails.customerId);
    fetchRequestDetail(momentBook);
  }, []);

  useEffect(() => {}, []);
  const requestLocationPermission = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Quyền truy cập vị trí",
          message: "Ứng dụng cần quyền để truy cập vị trí của bạn.",
          buttonNeutral: "Hỏi sau",
          buttonNegative: "Hủy",
          buttonPositive: "Đồng ý",
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        getCurrentLocation();
      } else {
        Alert.alert("Quyền truy cập vị trí bị từ chối");
      }
    } else {
      getCurrentLocation();
    }
  };

  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Quyền truy cập vị trí bị từ chối");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setCurrentLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };
  const calculateRoute = async () => {
    try {
      const response = await axios.get(
        `https://maps.vietmap.vn/api/route?api-version=1.1&apikey=${VIETMAP_API_KEY}&point=${pickupLocation.latitude},${pickupLocation.longitude}&point=${destinationLocation.latitude},${destinationLocation.longitude}&vehicle=car&points_encoded=true`
      );

      const { paths } = response.data;

      if (paths && paths.length > 0) {
        const routePath = paths[0];
        const decodedCoordinates = polyline
          .decode(routePath.points)
          .map((point) => ({
            latitude: point[0],
            longitude: point[1],
          }));

        setRouteData(decodedCoordinates);
        setDistance((routePath.distance / 1000).toFixed(1));
        setDuration(Math.round(routePath.time / 60000));
      } else {
        Alert.alert("Lỗi", "Không tìm thấy tuyến đường.");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể lấy dữ liệu điều hướng.");
      console.error(error);
    }
  };

  const calculateRouteDriverToCustomer = async () => {
    try {
      const response = await axios.get(
        `https://maps.vietmap.vn/api/route?api-version=1.1&apikey=${VIETMAP_API_KEY}&point=${currentLocation.latitude},${currentLocation.longitude}&point=${pickupLocation.latitude},${pickupLocation.longitude}&vehicle=car&points_encoded=true`
      );

      const { paths } = response.data;
      console.log("running api");
      if (paths && paths.length > 0) {
        const routePath = paths[0];
        const decodedCoordinates = polyline
          .decode(routePath.points)
          .map((point) => ({
            latitude: point[0],
            longitude: point[1],
          }));

        setRouteData(decodedCoordinates);
        setDistance((routePath.distance / 1000).toFixed(1));
        setDuration(Math.round(routePath.time / 60000));
      } else {
        Alert.alert("Lỗi", "Không tìm thấy tuyến đường.");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể lấy dữ liệu điều hướng.");
      console.error(error);
    }
  };
  const fetchCustomerDetails = async (customerId) => {
    try {
      const response = await axios.get(
        `http://${IP_ADDRESS}:3000/customer/detail/${customerId}`
      );
      if (response.data) {
        setCustomer(response.data);
      } else {
        console.log("No customer data found");
      }
    } catch (error) {
      console.error("Error fetching customer details:", error);
      Alert.alert("Lỗi", "Không thể lấy thông tin khách hàng");
    }
  };

  const fetchRequestDetail = async (momentBook) => {
    try {
      const response = await axios.get(
        `http://${IP_ADDRESS}:3000/booking-traditional/request-by-moment/${momentBook}`
      );

      if (response.data) {
        setRequest(response.data);
      } else {
        console.log("No request found for the given moment");
        Alert.alert(
          "Lỗi",
          "Không tìm thấy yêu cầu nào khớp với thời gian đã chọn."
        );
      }
    } catch (error) {
      console.error("Error fetching request details:", error);
      Alert.alert("Lỗi", "Không thể lấy thông tin yêu cầu");
    }
  };
  useEffect(() => {
    const initializeRequest = async () => {
      await fetchRequestDetail(momentBook); // Đảm bảo dữ liệu đã được lấy về
    };
    initializeRequest();
  }, [momentBook]);

  useEffect(() => {
    if (request) {
      // Chỉ chạy khi request đã có dữ liệu
      if (request.status === "confirmed" && currentLocation) {
        // calculateRouteDriverToCustomer();
      } else if (request.status === "on trip") {
        // calculateRoute();
      }
    }
  }, [request, currentLocation]);
  const updateStatus = async (newStatus) => {
    try {
      await axios.put(
        `http://${IP_ADDRESS}:3000/booking-traditional/update-status/${request._id}`,
        { status: newStatus }
      );
      setRequest((prev) => ({ ...prev, status: newStatus }));
      Alert.alert("Thông báo", `Trạng thái cập nhật thành ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái");
    }
  };
  const handleStatusUpdate = () => {
    let nextStatus;
    switch (request.status) {
      case "confirmed":
        nextStatus = "on the way";
        break;
      case "on the way":
        nextStatus = "arrived";
        break;
      case "arrived":
        nextStatus = "picked up";
        break;
      case "picked up":
        nextStatus = "on trip";
        break;
      case "on trip":
        nextStatus = "confirmed";
        break;
      default:
        Alert.alert("Thông báo", "Không thể cập nhật trạng thái");
        return;
    }
    updateStatus(nextStatus);
  };

  const getButtonLabel = () => {
    switch (request?.status) {
      case "confirmed":
        return "Đang đến";
      case "on the way":
        return "Đã đến";
      case "arrived":
        return "Đã đón";
      case "picked up":
        return "Bắt đầu hành trình";
      default:
        return "Cập nhật";
    }
  };
  const handleNavigate = () => {
    navigation.navigate("VietMapNavigationScreen", {
      pickupLocation,
      destinationLocation,
    });
  };
  const handleChat = () => {
    navigation.navigate("ChatScreenDriver", {
      userId: "6720c996743774e812904a02",
      role: "customer",
      customerId: "670bdfc8b65786a7225f39a1",
      roomId: request._id,
      customerName: customer.name,
      customerAvatar: customer.avatar,
      customerPhone: customer.phone,
      customerGender: customer.gender,
    });
  };
  const handleSupportCenterPress = () => {
    setSupportModalVisible(true);
  };
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={
          currentLocation || {
            latitude: bookingDetails.pickupLocation.latitude,
            longitude: bookingDetails.pickupLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }
        }
      >
        <Marker coordinate={pickupLocation} title="Điểm đón" pinColor="blue" />
        <Marker coordinate={destinationLocation} title="Điểm đến" />
        {routeData && (
          <Polyline
            coordinates={routeData}
            strokeWidth={4}
            strokeColor="blue"
          />
        )}
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Vị trí hiện tại"
            style={styles.currentMarker}
          >
            <View style={{ width: 35, height: 35 }}>
              <Ionicons name="navigate-circle" size={35} color="blue" />
            </View>
          </Marker>
        )}
      </MapView>
      <View style={styles.serviceContainer}>
        <TouchableOpacity style={styles.locationButton}>
          <Ionicons name="chatbox-outline" size={25} color="black" />
          <Text>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.serviceButton}>
          <Text style={styles.statusTime}> 1 . Đón khách</Text>
          <Text style={styles.serviceText}>{bookingDetails.serviceName}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navigateButton}
          onPress={handleNavigate}
        >
          <Ionicons name="navigate-circle" size={25} color="blue" />
          <Text style={styles.navigateText}>Điều hướng</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.customerName}>
          {customer ? customer.name : "Loading..."}
        </Text>
        <Text style={styles.locationText}>{pickupLocation.address}</Text>
        <View style={styles.fareContainer}>
          <Text style={styles.fareText}>
            {formatCurrency(bookingDetails.fare)}
          </Text>
          <Text style={styles.paymentMethodText}>
            {bookingDetails.paymentMethod === "cash" ? "Tiền mặt" : "MoMo"}
          </Text>
        </View>

        {/* <Text style={styles.fareText}>{momentBook}</Text> */}
        <View style={styles.distanceContainer}>
          <Text style={styles.distanceText}>Khoảng cách: {distance} km</Text>
          <Text style={styles.durationText}>Thời gian: {duration} phút</Text>
        </View>

        <View style={styles.controlButtons}>
          <TouchableOpacity style={styles.button} onPress={() => handleChat()}>
            <Ionicons name="chatbox-outline" size={20} color="black" />
            <Text>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Ionicons name="call-outline" size={20} color="black" />
            <Text>Gọi miễn phí</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={handleSupportCenterPress}
          >
            <Ionicons name="help-outline" size={20} color="black" />
            <Text>Trung tâm hỗ trợ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Ionicons name="ellipsis-horizontal" size={20} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.controlButtons}>
          {request && (
            <TouchableOpacity
              style={styles.statusBtn}
              onPress={handleStatusUpdate}
            >
              <Text style={styles.statusText}>{getButtonLabel()}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <SupportCenterModal
        visible={supportModalVisible}
        onClose={() => setSupportModalVisible(false)}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 3,
  },
  infoContainer: {
    flex: 2,
    padding: 13,
    backgroundColor: "white",
  },
  currentMarker: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  customerName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  locationText: {
    fontSize: 16,
    marginTop: 5,
  },
  fareContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10, // Điều chỉnh khoảng cách nếu cần
  },
  fareText: {
    fontSize: 18,
    color: "#4CAF50",
  },
  paymentMethodText: {
    fontSize: 13,
    color: "#fff",
    backgroundColor: "blue",
    padding: 5,
    marginLeft: 8,
    borderRadius: 40,
  },
  serviceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#ccc",
  },
  distanceText: {
    fontSize: 14,
  },
  distanceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  locationButton: {
    padding: 10,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  serviceButton: {
    padding: 10,
    alignItems: "center",
    // justifyContent: "flex-end",
    paddingLeft: 35,
  },
  statusTime: {
    fontSize: 20,
    paddingBottom: 5,
    fontWeight: "bold",
    color: "green",
  },

  serviceText: { fontSize: 14, fontWeight: "bold" },
  navigateButton: {
    padding: 10,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  navigateText: { fontSize: 12 },
  distanceText: {
    fontSize: 14,
  },
  durationText: {
    fontSize: 14,
  },
  controlButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  button: {
    alignItems: "center",
    padding: 10,
  },
  statusBtn: {
    backgroundColor: "#fbc02d",
    padding: 15,
    borderRadius: 40,
    flex: 1,
    alignItems: "center",
  },
  statusText: {
    color: "black",
    fontSize: 20,
    fontWeight: "bold",
  },
  moreOptions: {
    paddingLeft: 10,
  },
});

export default BookingTraditional;

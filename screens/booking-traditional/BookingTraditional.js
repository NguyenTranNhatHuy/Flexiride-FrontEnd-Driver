import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import polyline from "@mapbox/polyline";
import { formatCurrency } from "../../utils/FormatPrice";
import { VIETMAP_API_KEY, IP_ADDRESS } from "@env";
import LocationContext from "../../provider/LocationCurrentProvider";
// import Geolocation from "@react-native-community/geolocation";
import * as Location from "expo-location";
import SupportCenterModal from "./SupportCenterModal";
import VietmapGL from "@vietmap/vietmap-gl-react-native";
import Geolocation from "@react-native-community/geolocation";

const BookingTraditional = ({ navigation, route }) => {
  // const { currentLocation } = useContext(LocationContext);
  const [currentLocation, setCurrentLocation] = useState(null);

  const bookingDetails = route.params?.bookingDetails || {
    requestId: "672cb454b77f15a602eb2eb6",
    customerId: "670bdfc8b65786a7225f39a1",
    moment_book: "2024-11-15T09:00:14.466+00:00",
    pickupLocation: {
      latitude: 16.00921457301096,
      longitude: 108.2544115207258,
      address: "Tạp hóa Tứ Vang",
    },
    destinationLocation: {
      latitude: 15.978132,
      longitude: 108.262098,
      address: "Sân bay Quốc Tế",
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
  const [isLoading, setIsLoading] = useState(true); // Hiển thị trạng thái tải

  const pickupLocation = bookingDetails.pickupLocation;
  const destinationLocation = bookingDetails.destinationLocation;
  const mapRef = useRef(null);
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
  useEffect(() => {
    requestLocationPermission();
    fetchCustomerDetails(bookingDetails.customerId);
    fetchRequestDetail(momentBook);
  }, []);
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Quyền truy cập vị trí",
            message: "Ứng dụng cần quyền để xác định vị trí của bạn.",
            buttonNeutral: "Hỏi sau",
            buttonNegative: "Từ chối",
            buttonPositive: "Đồng ý",
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert("Thông báo", "Quyền truy cập vị trí bị từ chối");
          return false;
        }
      }
      return true;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  useEffect(() => {
    const fetchLocation = async () => {
      const permissionGranted = await requestLocationPermission();
      if (permissionGranted) {
        setIsLoading(true);
        Geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setCurrentLocation({
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
            setIsLoading(false);
          },
          (error) => {
            let message = "Không thể xác định vị trí của bạn.";
            if (error.code === 1) message = "Quyền truy cập vị trí bị từ chối.";
            if (error.code === 2) message = "Không tìm thấy vị trí khả dụng.";
            if (error.code === 3) message = "Hết thời gian chờ GPS.";
            Alert.alert("Lỗi GPS", message);
            setIsLoading(false);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      }
    };
    fetchLocation();
  }, []);

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
        console.log("custoerdata : ", response.data);
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
  // const handleStatusUpdate = () => {
  //   let nextStatus;
  //   switch (request.status) {
  //     case "confirmed":
  //       nextStatus = "on the way";
  //       break;
  //     case "on the way":
  //       nextStatus = "arrived";
  //       break;
  //     case "arrived":
  //       nextStatus = "picked up";
  //       break;
  //     case "picked up":
  //       nextStatus = "on trip";
  //       break;
  //     case "on trip":
  //       nextStatus = "confirmed";
  //       break;
  //     default:
  //       Alert.alert("Thông báo", "Không thể cập nhật trạng thái");
  //       return;
  //   }
  //   updateStatus(nextStatus);
  // };

  const handleStatusUpdate = () => {
    const statusFlow = [
      "confirmed",
      "on the way",
      "arrived",
      "picked up",
      "on trip",
    ];
    const currentIndex = statusFlow.indexOf(request.status);
    const nextStatus =
      currentIndex >= 0 && currentIndex < statusFlow.length - 1
        ? statusFlow[currentIndex + 1]
        : null;

    if (nextStatus) {
      updateStatus(nextStatus);
    } else {
      Alert.alert("Thông báo", "Không thể cập nhật trạng thái");
    }
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
    if (request?.status === "confirmed" && currentLocation) {
      navigation.navigate("VietMapNavigationScreen", {
        currentLocation,
        pickupLocation: {
          latitude: pickupLocation.latitude,
          longitude: pickupLocation.longitude,
        },
        destinationLocation: {
          latitude: destinationLocation.latitude,
          longitude: destinationLocation.longitude,
        },
        status: request.status,
      });
    } else if (request?.status === "on trip") {
      // Điều hướng từ điểm đón khách hàng đến điểm đến
      navigation.navigate("VietMapNavigationScreen", {
        currentLocation,
        pickupLocation: {
          latitude: pickupLocation.latitude,
          longitude: pickupLocation.longitude,
        },
        destinationLocation: {
          latitude: destinationLocation.latitude,
          longitude: destinationLocation.longitude,
        },
        status: request.status,
      });
    } else {
      Alert.alert("Thông báo", "Trạng thái không hợp lệ để điều hướng.");
    }
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
      {currentLocation ? (
        <VietmapGL.MapView
          ref={mapRef}
          style={styles.map}
          styleURL={`https://maps.vietmap.vn/api/maps/light/styles.json?apikey=${VIETMAP_API_KEY}`}
        >
          <VietmapGL.Camera
            centerCoordinate={[
              currentLocation?.longitude || pickupLocation.longitude,
              currentLocation?.latitude || pickupLocation.latitude,
            ]}
            zoomLevel={12}
          />

          {/* ShapeSource với các điểm */}
          <VietmapGL.ShapeSource
            id="locationSource"
            shape={{
              type: "FeatureCollection",
              features: [
                // Vị trí tài xế
                currentLocation && {
                  type: "Feature",
                  geometry: {
                    type: "Point",
                    coordinates: [
                      currentLocation.longitude,
                      currentLocation.latitude,
                    ],
                  },
                  properties: {
                    title: "Tài xế",
                    icon: "marker",
                  },
                },
                // Điểm đón
                {
                  type: "Feature",
                  geometry: {
                    type: "Point",
                    coordinates: [
                      pickupLocation.longitude,
                      pickupLocation.latitude,
                    ],
                  },
                  properties: {
                    title: "Điểm đón",
                    icon: "https://encrypted-tbn1.gstatic.com/licensed-image?q=tbn:ANd9GcQ9aLbvGR6NvEb4cLQyALxUbHJEuaoGOyeIhRA_fAmRfRNMMJP4ZkDBKxK_iCExUb0wlVVZB8m93yddGy4", // Đường dẫn hình ảnh
                  },
                },
                // Điểm đến
                {
                  type: "Feature",
                  geometry: {
                    type: "Point",
                    coordinates: [
                      destinationLocation.longitude,
                      destinationLocation.latitude,
                    ],
                  },
                  properties: {
                    title: "Điểm đến",
                    icon: require("../../assets/destination-icon.png"), // Đường dẫn hình ảnh
                  },
                },
              ].filter(Boolean), // Loại bỏ giá trị null
            }}
          >
            <VietmapGL.SymbolLayer
              id="locationLayer"
              style={{
                iconImage: ["get", "icon"], // Lấy biểu tượng từ `properties.icon`
                iconSize: 0.5, // Kích thước biểu tượng
                textField: ["get", "title"], // Hiển thị tiêu đề
                textSize: 12, // Kích thước văn bản
                textAnchor: "top", // Đặt văn bản phía trên biểu tượng
                textOffset: [0, 1.5], // Văn bản cách biểu tượng một khoảng
              }}
            />
          </VietmapGL.ShapeSource>
        </VietmapGL.MapView>
      ) : (
        <ActivityIndicator size="large" color="blue" />
      )}
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

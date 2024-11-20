import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import polyline from "@mapbox/polyline";
import { formatCurrency } from "../../utils/FormatPrice";
import { VIETMAP_API_KEY, IP_ADDRESS } from "@env";
import SupportCenterModal from "./SupportCenterModal";
import VietmapGL from "@vietmap/vietmap-gl-react-native";
import useLocation from "../../hook/useLocation";

const BookingTraditional = ({ navigation, route }) => {
  const { currentLocation } = useLocation();

  const bookingDetails = route.params?.bookingDetails || {
    requestId: "6739b0001c24fd4a5690f0b7",
    customerId: "670bdfc8b65786a7225f39a1",
    moment_book: "2024-11-17T08:57:35.252+00:00",
    pickupLocation: {
      latitude: 16.012117311109478,
      longitude: 108.2564244400793,
      address: "Quán Mỹ Liên, 30 Lê Văn Hiến",
    },
    destinationLocation: {
      latitude: 16.036281734248348,
      longitude: 108.21906585095698,
      address: "Khu trưng bày sản phẩm, 20 Hồ Biểu Chánh",
    },
    customerName: "Nguyễn Văn A",
    price: 100000, // Giá giả định
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
  const [selectedLocation, setSelectedLocation] = useState(null);
  const mapRef = useRef(null);
  const routeCache = {};

  useEffect(() => {
    console.table("booking detail data: ", bookingDetails);
    fetchCustomerDetails(bookingDetails.customerId);
    fetchRequestDetail(momentBook);
  }, []);

  useEffect(() => {
    if (currentLocation) {
      console.log("Vị trí hiện tại:", currentLocation);
    }
  }, [currentLocation]);

  const fetchCustomerDetails = async (customerId) => {
    try {
      const response = await axios.get(
        `http://${IP_ADDRESS}:3000/customer/detail/${customerId}`
      );
      if (response.data) {
        setCustomer(response.data);
        // console.warn("customer data : ", response.data);
      } else {
        console.log("No customer data found");
      }
    } catch (error) {
      console.error("Error fetching customer details:", error);
      Alert.alert("Lỗi", "Không thể lấy thông tin khách hàng");
    }
  };

  const fetchRequestDetail = async (momentBook) => {
    console.log("🚀 ~ fetchRequestDetail ~ momentBook:", momentBook);

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
      await fetchRequestDetail(momentBook);
    };
    initializeRequest();
  }, [momentBook]);
  // useEffect(() => {
  //   if (currentLocation && request?.status) {
  //     if (request.status === "confirmed") {
  //       calculateRoute(currentLocation, pickupLocation);
  //     } else if (request.status === "on trip") {
  //       calculateRoute(pickupLocation, destinationLocation);
  //     }
  //   }
  // }, [currentLocation, request]);

  useEffect(() => {
    if (currentLocation && request?.status) {
      // Define the status groups for better readability
      const toPickupStatuses = ["confirmed", "on the way", "arrived"];
      const toDestinationStatuses = ["picked up", "on trip", "completed"];

      if (toPickupStatuses.includes(request.status)) {
        calculateRoute(currentLocation, pickupLocation);
      } else if (toDestinationStatuses.includes(request.status)) {
        calculateRoute(pickupLocation, destinationLocation);
      }
    }
  }, [currentLocation, request]);

  const calculateRoute = async (start, end) => {
    const routeKey = `${start.latitude},${start.longitude}-${end.latitude},${end.longitude}`;

    // Check if route data is already cached
    if (routeCache[routeKey]) {
      const cachedRoute = routeCache[routeKey];
      setRouteData(cachedRoute.decodedCoordinates);
      setDistance(cachedRoute.distance);
      setDuration(cachedRoute.duration);
      return;
    }

    try {
      // Make API call for route calculation
      const response = await axios.get(
        `https://maps.vietmap.vn/api/route?api-version=1.1&apikey=${VIETMAP_API_KEY}&point=${start.latitude},${start.longitude}&point=${end.latitude},${end.longitude}&vehicle=car&points_encoded=true`
      );

      const { paths } = response.data;
      if (paths && paths.length > 0) {
        const routePath = paths[0];
        const decodedCoordinates = polyline
          .decode(routePath.points)
          .map(([latitude, longitude]) => ({ latitude, longitude }));

        // Calculate distance and duration
        const calculatedDistance = (routePath.distance / 1000).toFixed(1); // Convert to km
        const calculatedDuration = Math.max(
          1,
          Math.round(routePath.time / 60000)
        ); // Ensure minimum of 1 minute

        // Cache the route data
        routeCache[routeKey] = {
          decodedCoordinates,
          distance: calculatedDistance,
          duration: calculatedDuration,
        };

        // Update state
        setRouteData(decodedCoordinates);
        setDistance(calculatedDistance);
        setDuration(calculatedDuration);
      } else {
        Alert.alert("Lỗi", "Không tìm thấy tuyến đường.");
      }
    } catch (error) {
      console.error("Error calculating route:", error);
      if (error.response?.status === 429) {
        Alert.alert("Thông báo", "Quá nhiều yêu cầu, vui lòng thử lại sau.");
      }
    }
  };

  const updateStatus = async (newStatus) => {
    if (!request?._id) {
      Alert.alert("Lỗi", "Không thể tìm thấy yêu cầu để cập nhật trạng thái.");
      return;
    }

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
    const statusFlow = [
      "confirmed", // tài xế đã xác nhận request
      "on the way", // đang trên đường đến điểm đón
      "arrived", // đã đến điểm đón
      "picked up", // đã đón khách
      "on trip", // đang trên chuyến hành trình
      "dropped off", // đã trả khách
      "completed", // đã hoàn thành
    ];

    if (!request || !request.status) {
      Alert.alert("Lỗi", "Trạng thái yêu cầu không hợp lệ.");
      return;
    }

    const currentIndex = statusFlow.indexOf(request.status);
    if (currentIndex === -1) {
      Alert.alert(
        "Lỗi",
        "Trạng thái hiện tại không nằm trong danh sách hợp lệ."
      );
      return;
    }

    const nextStatus = statusFlow[currentIndex + 1];
    if (!nextStatus) {
      Alert.alert("Thông báo", "Không thể cập nhật trạng thái tiếp theo.");
      return;
    }

    updateStatus(nextStatus);

    // Điều hướng đến màn hình thanh toán khi trạng thái là 'dropped off'
    if (nextStatus === "dropped off") {
      navigation.navigate("PaymentScreen", {
        bookingDetails,
        distance,
        duration,
      });
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
      case "on trip":
        return "Đã trả khách";
      case "dropped off":
        return "Hoàn thành chuyến";
      case "completed":
        return "Đã hoàn thành";
      default:
        return "Cập nhật";
    }
  };

  const handleNavigate = () => {
    if (!currentLocation || !pickupLocation || !destinationLocation) {
      Alert.alert("Lỗi", "Không đủ thông tin để điều hướng.");
      return;
    }

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

  const getAddressToDisplay = () => {
    if (!request?.status) {
      return "Trạng thái không khả dụng"; // Default message when status is undefined
    }
    if (["confirmed", "on the way", "arrived"].includes(request.status)) {
      return `Điểm đón: ${pickupLocation.address}`;
    } else if (["picked up", "on trip", "completed"].includes(request.status)) {
      return `Điểm đến: ${destinationLocation.address}`;
    }
    return "Không có thông tin địa chỉ";
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
          {routeData && (
            <VietmapGL.ShapeSource
              id="routeSource"
              shape={{
                type: "Feature",
                geometry: {
                  type: "LineString",
                  coordinates: routeData.map(({ longitude, latitude }) => [
                    longitude,
                    latitude,
                  ]),
                },
              }}
            >
              <VietmapGL.LineLayer
                id="routeLayer"
                style={{
                  lineColor: "blue",
                  lineWidth: 5,
                  lineOpacity: 0.8,
                }}
              />
            </VietmapGL.ShapeSource>
          )}
          {/* ShapeSource với các điểm */}
          <VietmapGL.ShapeSource
            id="locationSource"
            shape={{
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
                    title: "Tài xế",
                    icon: require("../../assets/current-location.png"),
                  },
                },
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
                    icon: require("../../assets/pickup-icon.png"),
                  },
                },
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
                    icon: require("../../assets/destination-icon.png"),
                  },
                },
              ].filter(Boolean),
            }}
          >
            <VietmapGL.SymbolLayer
              id="locationLayer"
              style={{
                iconImage: ["get", "icon"],
                iconSize: 1,
                textField: ["get", "title"],
                textSize: 12,
                textAnchor: "top",
                textOffset: [0, 1.5],
              }}
            />
          </VietmapGL.ShapeSource>
        </VietmapGL.MapView>
      ) : (
        <ActivityIndicator size="large" color="blue" />
      )}
      <View style={styles.serviceContainer}>
        <TouchableOpacity
          style={styles.navigateButton}
          onPress={handleNavigate}
        >
          <Ionicons name="navigate-circle" size={25} color="blue" />
          <Text style={styles.navigateText}>Điều hướng</Text>
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
        <Text style={styles.selectedLocationText}>{getAddressToDisplay()}</Text>
        <View style={styles.fareContainer}>
          <Text style={styles.fareText}>
            {formatCurrency(bookingDetails.price)}
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
        bookingDetails={bookingDetails}
        currentLocation={currentLocation}
        navigation={navigation}
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
    fontSize: 15,
    paddingBottom: 5,
    fontWeight: "bold",
    color: "green",
  },

  serviceText: { fontSize: 15, fontWeight: "bold" },
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

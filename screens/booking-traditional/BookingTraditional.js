import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  PermissionsAndroid,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import polyline from "@mapbox/polyline";
import { formatCurrency } from "../../utils/FormatPrice";
import { VIETMAP_API_KEY, IP_ADDRESS } from "@env";
import SupportCenterModal from "./SupportCenterModal";
import VietmapGL from "@vietmap/vietmap-gl-react-native";
import useLocation from "../../hook/useLocation";
import { useAuth } from "../../provider/AuthProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import io from "socket.io-client";
import call from "react-native-phone-call";

const BookingTraditional = ({ navigation, route }) => {
  const { currentLocation } = useLocation();

  const bookingDetails = route.params?.bookingDetails;
  const momentBook = bookingDetails?.moment_book;
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [request, setRequest] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [supportModalVisible, setSupportModalVisible] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const pickupLocation = bookingDetails.pickupLocation;
  const destinationLocation = bookingDetails.destinationLocation;
  const mapRef = useRef(null);
  const routeCache = {};
  const { authState } = useAuth();
  const socket = useRef(null);
  const [hasCanceledRide, setHasCanceledRide] = useState(false);

  useEffect(() => {
    console.log("booking detail data:     ", bookingDetails);
    fetchCustomerDetails(bookingDetails.customerId);
    fetchRequestDetail(momentBook);
  }, []);

  useEffect(() => {
    if (!socket.current) {
      socket.current = io(`https://flexiride.onrender.com`, {
        transports: ["websocket"],
        query: { driverId: authState.userId },
      });
    }
    socket.current.on("rideCanceled", ({ requestId, reason }) => {
      if (!hasCanceledRide) {
        // Kiểm tra trạng thái hủy chuyến
        setHasCanceledRide(true); // Đánh dấu đã xử lý
        setActiveBooking(null);
        AsyncStorage.removeItem("activeBooking");
        Alert.alert("Thông báo", `Khách hàng đã hủy chuyến đi: ${reason}.`, [
          { text: "Đã hiểu" },
        ]);
        navigation.replace("DriverScreen");
      }
    });
    return () => {
      if (socket.current) {
        socket.current.off("rideCanceled");

        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, []);
  useEffect(() => {
    const saveBookingToStorage = async () => {
      try {
        if (bookingDetails) {
          await AsyncStorage.setItem(
            "activeBooking",
            JSON.stringify(bookingDetails)
          );
        }
      } catch (error) {
        console.error("Error saving booking to storage: ", error);
      }
    };

    saveBookingToStorage();

    return () => {
      // Clear active booking if trip is completed
      if (request?.status === "dropped off") {
        AsyncStorage.removeItem("activeBooking");
      }
    };
  }, [bookingDetails, request?.status]);
  const fetchCustomerDetails = async (customerId) => {
    try {
      const response = await axios.get(
        `https://flexiride.onrender.com/customer/detail/${customerId}`
      );
      if (response.data) {
        setCustomer(response.data);
        console.log("customer data : ", response.data);
      } else {
        console.log("No customer data found");
      }
    } catch (error) {
      console.error("Error fetching customer details: ", error);
      Alert.alert("Lỗi", "Không thể lấy thông tin khách hàng");
    }
  };

  const fetchRequestDetail = async (momentBook) => {
    console.log("🚀 ~ fetchRequestDetail ~ momentBook:", momentBook);

    try {
      const response = await axios.get(
        `https://flexiride.onrender.com/booking-traditional/request-by-moment/${momentBook}`
      );

      if (response.data) {
        setRequest(response.data);
        console.log("🚀 ~ fetchRequestDetail ~ response.data:", response.data);
      } else {
        console.log("No request found for the given moment");
        Alert.alert(
          "Lỗi",
          "Không tìm thấy yêu cầu nào khớp với thời gian đã chọn."
        );
      }
    } catch (error) {
      console.error("Error fetching request details:", error);
      navigation.replace("DriverScreen");
      Alert.alert("Lỗi", "Không thể lấy thông tin yêu cầu");
    }
  };
  useEffect(() => {
    const initializeRequest = async () => {
      await fetchRequestDetail(momentBook);
    };
    initializeRequest();
  }, [momentBook]);

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
        `https://maps.vietmap.vn/api/route?api-version=1.1&apikey=${VIETMAP_API_KEY}&point=${start.latitude},${start.longitude}&point=${end.latitude},${end.longitude}&vehicle=motorcycle&points_encoded=true`
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

    // Kiểm tra nếu trạng thái đang được cập nhật
    if (isUpdatingStatus) {
      console.log("Đang cập nhật trạng thái, vui lòng chờ...");
      return;
    }

    try {
      setIsUpdatingStatus(true); // Bắt đầu quá trình cập nhật
      await axios.put(
        `https://flexiride.onrender.com/booking-traditional/update-status/${request._id}`,
        { status: newStatus }
      );

      setRequest((prev) => ({ ...prev, status: newStatus }));
      console.log("🚀 ~ updateStatus ~ newStatus:", newStatus);

      // Gửi thông báo cập nhật trạng thái qua socket
      if (socket.current) {
        socket.current.emit("updateStatus", {
          requestId: request._id,
          newStatus,
        });
        console.log("🚀 socket event sent:", newStatus);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái");
    } finally {
      setIsUpdatingStatus(false); // Hoàn tất quá trình cập nhật
    }
  };

  const handleStatusUpdate = () => {
    if (isUpdatingStatus) {
      Alert.alert("Thông báo", "Đang cập nhật trạng thái, vui lòng chờ...");
      return;
    }

    const statusFlow = [
      "confirmed", // tài xế đã xác nhận request
      "on the way", // đang trên đường đến điểm đón
      "arrived", // đã đến điểm đón
      "picked up", // đã đón khách
      "on trip", // đang trên chuyến hành trình
      "dropped off", // đã trả khách
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

    // Cập nhật trạng thái và điều hướng khi hoàn thành
    updateStatus(nextStatus).then(() => {
      if (nextStatus === "dropped off") {
        navigation.navigate("PaymentScreen", {
          bookingDetails,
          requestId: request._id,
          customerName: customer.name,
        });
      }
    });
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
      userId: authState.userId,
      role: "customer",
      customerId: request.account_id,
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
  useEffect(() => {
    requestCallPermission(); // Yêu cầu quyền khi modal được mở
  }, []);

  // Yêu cầu quyền gọi điện trên Android
  const requestCallPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CALL_PHONE,
        {
          title: "Cấp quyền gọi điện",
          message: "Ứng dụng cần quyền để thực hiện cuộc gọi khẩn cấp.",
          buttonPositive: "Đồng ý",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };
  const handleCall = async () => {
    const phoneNumber = customer.phone;
    const hasPermission = await requestCallPermission(); // Kiểm tra quyền gọi điện

    if (!hasPermission) {
      Alert.alert("Lỗi", "Ứng dụng chưa được cấp quyền gọi điện.");
      return;
    }

    const args = {
      number: phoneNumber,
      prompt: true, // Hiển thị xác nhận trước khi thực hiện cuộc gọi
    };

    call(args)
      .then(() => console.log("Mở ứng dụng gọi điện thành công"))
      .catch((error) => {
        console.error("Không thể mở ứng dụng gọi điện :", error);
        Alert.alert("Lỗi", "Không thể thực hiện cuộc gọi.");
      });
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

  const handleRelocate = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.setCamera({
        centerCoordinate: [currentLocation.longitude, currentLocation.latitude],
        zoomLevel: 18, // Zoom mức phù hợp
        animationDuration: 1000, // Thời gian hiệu ứng (ms)
      });
    } else {
      Alert.alert("Lỗi", "Không thể xác định vị trí hiện tại.");
    }
  };

  const openGoogleMaps = (startLocation, endLocation) => {
    if (!startLocation || !endLocation) {
      Alert.alert(
        "Lỗi",
        "Thông tin điểm bắt đầu hoặc điểm kết thúc không hợp lệ."
      );
      return;
    }

    const origin = `${startLocation.latitude},${startLocation.longitude}`;
    const destination = `${endLocation.latitude},${endLocation.longitude}`;

    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;

    Linking.openURL(googleMapsUrl).catch((err) =>
      Alert.alert("Lỗi", "Không thể mở Google Maps.")
    );
  };

  return (
    <View style={styles.container}>
      {currentLocation ? (
        <>
          <VietmapGL.MapView
            ref={mapRef}
            style={styles.map}
            styleURL={`https://maps.vietmap.vn/api/maps/light/styles.json?apikey=${VIETMAP_API_KEY}`}
          >
            <VietmapGL.Camera
              ref={mapRef} // Đảm bảo camera được liên kết với ref
              centerCoordinate={[
                currentLocation?.longitude || pickupLocation.longitude,
                currentLocation?.latitude || pickupLocation.latitude,
              ]}
              zoomLevel={18} // Mức zoom ban đầu
              animationMode="flyTo" // Hiệu ứng khi camera di chuyển
              animationDuration={1000} // Thời gian hiệu ứng, tính bằng ms
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
                      color: "blue",
                      title: "Vị trí hiện tại",
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
                      color: "green",
                      title: "Điểm đón",
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
                      color: "red",
                      title: "Điểm đến",
                    },
                  },
                ],
              }}
            >
              {/* Vòng tròn để hiển thị vị trí */}
              <VietmapGL.CircleLayer
                id="circleLayer"
                style={{
                  circleColor: ["get", "color"],
                  circleRadius: 8,
                  circleStrokeWidth: 2,
                  circleStrokeColor: "white",
                }}
              />

              {/* Hiển thị nhãn tiêu đề */}
              <VietmapGL.SymbolLayer
                id="symbolLayer"
                style={{
                  textField: ["get", "title"],
                  textSize: 14,
                  textColor: "black",
                  textHaloColor: "white",
                  textHaloWidth: 2,
                  textOffset: [0, 1.5],
                }}
              />
            </VietmapGL.ShapeSource>
          </VietmapGL.MapView>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate("DriverScreen")}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.googleMapButton}
            onPress={() => {
              if (
                request?.status === "confirmed" ||
                request?.status === "on the way"
              ) {
                openGoogleMaps(currentLocation, pickupLocation);
              } else if (
                request?.status === "picked up" ||
                request?.status === "on trip"
              ) {
                openGoogleMaps(pickupLocation, destinationLocation);
              } else {
                Alert.alert(
                  "Lỗi",
                  "Không thể điều hướng với trạng thái hiện tại."
                );
              }
            }}
          >
            <Ionicons name="navigate-circle" size={30} color="white" />
          </TouchableOpacity>
        </>
      ) : (
        <ActivityIndicator size="large" color="blue" />
      )}

      <View style={styles.serviceContainer}>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={handleRelocate}
        >
          <Ionicons name="locate-outline" size={25} color="blue" />
          <Text style={styles.navigateText}>Định vị</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.serviceButton}>
          <Text style={styles.serviceText}>
            Dịch vụ: {bookingDetails.serviceName}
          </Text>
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={styles.navigateButton}
          onPress={() => {
            if (
              request?.status === "confirmed" ||
              request?.status === "on the way"
            ) {
              openGoogleMaps(currentLocation, pickupLocation);
            } else if (
              request?.status === "picked up" ||
              request?.status === "on trip"
            ) {
              openGoogleMaps(pickupLocation, destinationLocation);
            } else {
              Alert.alert(
                "Lỗi",
                "Không thể điều hướng với trạng thái hiện tại."
              );
            }
          }}
        >
          <Ionicons name="navigate-circle" size={25} color="blue" />
          <Text style={styles.navigateText}>Điều hướng với Google Maps</Text>
        </TouchableOpacity> */}
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
        <View style={styles.distanceContainer}>
          <Text style={styles.distanceText}>
            Khoảng cách:{" "}
            {distance < 1
              ? `${Math.round(distance * 1000)} m` // Hiển thị bằng mét nếu nhỏ hơn 1 km
              : `${distance} km`}
          </Text>
          <Text style={styles.durationText}>Thời gian: {duration} phút</Text>
        </View>

        <View style={styles.controlButtons}>
          <TouchableOpacity style={styles.button} onPress={() => handleChat()}>
            <Ionicons name="chatbox-outline" size={20} color="black" />
            <Text>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleCall}>
            <Ionicons name="call-outline" size={20} color="black" />
            <Text>Gọi</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={handleSupportCenterPress}
          >
            <Ionicons name="help-outline" size={20} color="black" />
            <Text>Trung tâm hỗ trợ</Text>
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
    position: "relative",
  },
  map: {
    flex: 2,
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
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "#ccc",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Bóng trên Android
  },

  googleMapButton: {
    position: "absolute",
    bottom: 480,
    right: 20,
    backgroundColor: "ccc",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
});

export default BookingTraditional;

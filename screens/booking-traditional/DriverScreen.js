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
import { useAuth } from "../../provider/AuthProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DriverScreen = ({ navigation }) => {
  const { currentLocation, getOneTimeLocation } = useLocation();

  const [isOnline, setIsOnline] = useState(false);
  const [rideRequest, setRideRequest] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [serviceName, setServiceName] = useState(null);
  const [showMissedScreen, setShowMissedScreen] = useState(false);
  const [isEarningsVisible, setIsEarningsVisible] = useState(false);
  const [driverEarnings, setDriverEarnings] = useState(0);
  const [activeBooking, setActiveBooking] = useState(null);
  const [request, setRequest] = useState(null);
  const [hasCanceledRide, setHasCanceledRide] = useState(false);

  const toggleEarningsPopup = () => {
    setIsEarningsVisible(!isEarningsVisible);
  };
  const handleNavigate = () => {
    navigation.navigate("ServiceSelection");
  };
  const [isLoading, setIsLoading] = useState(false);
  const { authState } = useAuth();
  const socket = useRef(null);
  const mapRef = useRef(null);
  useEffect(() => {
    fetchEarnings();
  }, [isOnline]);

  useEffect(() => {
    if (isOnline && currentLocation) {
      handleSocketConnect();
    }
  }, [isOnline, currentLocation]);

  useEffect(() => {
    if (!socket.current) {
      socket.current = io(`https://flexiride.onrender.com`, {
        transports: ["websocket"],
        query: { driverId: authState.userId },
      });
      socket.current.on("connect", () => handleSocketConnect());
      socket.current.on("disconnect", handleSocketDisconnect);
      socket.current.on("newRideRequest", handleNewRideRequest);
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
    }

    return () => {
      if (socket.current) {
        socket.current.off("rideCanceled");
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, [hasCanceledRide]);
  useEffect(() => {
    if (socket.current) {
      socket.current.on("notification", (message) => {
        Alert.alert(message.title, message.body);
      });
    }

    return () => {
      if (socket.current) {
        socket.current.off("notification");
      }
    };
  }, []);

  // useEffect(() => {
  //   const clearAllStorage = async () => {
  //     try {
  //       await AsyncStorage.clear();
  //       console.log("All storage cleared successfully!");
  //     } catch (error) {
  //       console.error("Failed to clear storage:", error);
  //     }
  //   };

  //   clearAllStorage();
  // }, []);

  // useEffect(() => {
  //   const clearActiveBooking = async () => {
  //     try {
  //       await AsyncStorage.removeItem("activeBooking");
  //       console.log("Active booking cleared successfully!");
  //     } catch (error) {
  //       console.error("Failed to clear active booking:", error);
  //     }
  //   };

  //   // Gọi hàm để xóa
  //   clearActiveBooking();
  // }, []);
  useEffect(() => {
    const loadActiveBooking = async () => {
      try {
        const booking = await AsyncStorage.getItem("activeBooking");
        if (booking) {
          const parsedBooking = JSON.parse(booking);
          setActiveBooking(parsedBooking);
        }
      } catch (error) {
        console.error("Error loading active booking: ", error);
      }
    };

    loadActiveBooking();
  }, []); // Chỉ chạy khi component được mount

  useEffect(() => {
    if (
      !activeBooking?.moment_book ||
      request?.moment_book === activeBooking.moment_book
    ) {
      return; // Không gọi API nếu không có thay đổi
    }

    const fetchRequestDetail = async (momentBook) => {
      try {
        const response = await axios.get(
          `https://flexiride.onrender.com/booking-traditional/request-by-moment/${momentBook}`
        );

        if (response.data) {
          setRequest(response.data);

          if (response.data.status === "completed") {
            await AsyncStorage.removeItem("activeBooking");

            setActiveBooking(null);
          } else if (response.data.status === "canceled") {
            await AsyncStorage.removeItem("activeBooking");

            setActiveBooking(null);
            await AsyncStorage.removeItem("activeBooking");
            console.log("removed activebooking");
          }
        } else {
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

    fetchRequestDetail(activeBooking.moment_book);
  }, [activeBooking, request]);

  const navigateToBooking = () => {
    if (activeBooking) {
      navigation.navigate("BookingTraditional", {
        bookingDetails: activeBooking,
      });
    }
  };
  const handleSocketConnect = () => {
    if (isOnline && currentLocation) {
      const driverData = {
        id: authState.userId,
        currentLocation: {
          lat: currentLocation.latitude,
          lng: currentLocation.longitude,
        },
      };
      console.log("driverData being sent:", driverData);
      if (socket.current) {
        socket.current.emit("driverOnline", driverData);
      }
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
    if (activeBooking) {
      console.log("Driver is busy. Ignoring new request.");
      return;
    }
    if (rideRequest || modalVisible) {
      console.log(
        "Driver is already handling a request. Ignoring new request."
      );
      return; // Bỏ qua yêu cầu nếu tài xế đã có yêu cầu
    }
    setRideRequest(request);
    setModalVisible(true);

    fetchServiceName(request.serviceId);

    setTimeout(() => {
      if (modalVisible) {
        handleMissedRequest();
        socket.current.emit("bookingRequestExpired", {
          bookingRequestId: request.requestId,
        });
      }
    }, 15000);
    return () => clearTimeout(timer); // Cleanup nếu modal bị đóng trước 15 giây
  };

  const handleGoOnline = async () => {
    try {
      const response = await axios.get(
        `https://flexiride.onrender.com/driver/${authState.userId}/services`
      );

      if (!response.data.data || response.data.data.length === 0) {
        Alert.alert(
          "Lỗi",
          "Bạn phải chọn ít nhất một dịch vụ trước khi online."
        );
        return;
      }
      const responseDriverDetail = await axios.get(
        `https://flexiride.onrender.com/driver/detail/${authState.userId}`
      );
      if (
        !responseDriverDetail.data.driver.isActive ||
        responseDriverDetail.data.driver.lockStatus
      ) {
        Alert.alert(
          "Thông báo",
          "Tài khoản của bạn đã bị khóa, vui lòng kiểm tra email và liên hệ admin để được giải quyết!"
        );
        return;
      }

      if (currentLocation) {
        setIsOnline(true);
        console.log("Going online with currentLocation:", currentLocation);
      } else {
        Alert.alert("Lỗi", "Không thể bật kết nối nếu không có vị trí.");
      }
    } catch (error) {
      console.error("Error checking services:", error);
      Alert.alert("Lỗi", "Không thể kiểm tra danh sách dịch vụ.");
    }
  };

  const handleGoOffline = () => {
    setIsOnline(false);
    socket.current?.emit("driverOffline", { id: authState.userId });
  };

  const backOnline = () => {
    setIsOnline(true);
    setShowMissedScreen(false);
  };

  // 6. Xử lý yêu cầu đặt xe
  const handleAcceptRequest = () => {
    socket.current?.emit("acceptRide", {
      requestId: rideRequest.requestId,
      driverId: authState.userId,
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
        `https://flexiride.onrender.com/booking-traditional/vehicle/${serviceId}`
      );
      setServiceName(response.data.name);
    } catch (error) {
      console.error("Error fetching service name:", error);
      setServiceName("Unknown Service");
    }
  };
  const fetchEarnings = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `https://flexiride.onrender.com/payment-history/income/today/${authState.userId}`
      );
      const { driverIncome } = response.data; // Thu nhập sau khi tính 70%
      setDriverEarnings(driverIncome);
    } catch (error) {
      console.error("Error fetching driver earnings:", error);
      Alert.alert("Lỗi", "Không thể lấy thông tin thu nhập.");
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleRelocate = () => {
    if (getOneTimeLocation) {
      getOneTimeLocation();
    } else {
      Alert.alert("Lỗi", "Không thể làm mới vị trí hiện tại.");
    }
  };
  useEffect(() => {
    const updateDriverLocation = async () => {
      if (!currentLocation) return;

      try {
        const locationData = {
          driverId: authState.userId,
          location: {
            type: "Point",
            coordinates: [currentLocation.longitude, currentLocation.latitude],
          },
        };

        await axios.put(
          `https://flexiride.onrender.com/driver/update-location`,
          locationData
        );

        if (socket.current) {
          socket.current.emit("driverLocationUpdate", locationData);
        }
      } catch (error) {
        console.error("Error updating location:", error);
      }
    };

    const intervalId = setInterval(updateDriverLocation, 10000); // Cập nhật mỗi 5 giây

    return () => clearInterval(intervalId); // Cleanup khi component unmount
  }, [currentLocation]);

  return (
    <View style={styles.container}>
      {currentLocation ? (
        <VietmapGL.MapView
          ref={mapRef}
          style={{ flex: 1 }}
          // styleURL={`https://maps.vietmap.vn/api/maps/light/styles.json?apikey=${VIETMAP_API_KEY}`}
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
      <TouchableOpacity
        style={styles.earningsButton}
        onPress={toggleEarningsPopup}
      >
        <Ionicons name="stats-chart" size={24} color="black" />
        <Text style={styles.earningsText}>Thu nhập</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => navigation.navigate("DriverProfile")}
      >
        <Ionicons name="person-circle-outline" size={50} color="black" />
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>5.0</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.bottomLeftControls}>
        {activeBooking && (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={navigateToBooking}
          >
            <Ionicons name="car-sport-outline" size={24} color="white" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => navigation.replace("DriverScreen")}
        >
          <Ionicons name="reload-outline" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={handleRelocate}>
          <Ionicons name="locate-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
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
          <TouchableOpacity
            style={styles.serviceButton}
            onPress={() => navigation.navigate("ServiceScreen")}
          >
            <Ionicons name="car-outline" size={24} color="black" />
            <Text style={styles.serviceText}>Loại dịch vụ</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.serviceButton}
            onPress={() => handleNavigate()}
          >
            <Ionicons name="location-outline" size={24} color="black" />
            <Text style={styles.serviceText}>Xe ghép</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.serviceButton}
            onPress={() => navigation.navigate("Earnings")}
          >
            <Ionicons name="briefcase-outline" size={24} color="black" />
            <Text style={styles.serviceText}>Thu nhập</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.serviceButton}
            onPress={() => navigation.navigate("DriverProfile")}
          >
            <MaterialIcons name="more-horiz" size={24} color="black" />
            <Text style={styles.serviceText}>Hồ sơ</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalDistance}>{serviceName}</Text>
            <Text style={styles.modalPaymentMethod}>
              Phương thức thanh toán:{" "}
              {rideRequest?.paymentMethod === "cash"
                ? "Tiền mặt"
                : "Thanh toán online"}
            </Text>

            {/* Giá cước */}
            <Text style={styles.modalFare}>
              Giá cước: {formatCurrency(rideRequest?.price)}
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
      {isEarningsVisible && (
        <View style={styles.earningsPopup}>
          <View
            style={styles.earningsDetail}
            onPress={() => navigation.navigate("Earnings")}
          >
            <View>
              <Text style={styles.detailLabel}>Thu nhập</Text>
              <Text style={styles.detailValue}>
                {formatCurrency(driverEarnings)}
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate("Earnings")}>
              <Ionicons name="chevron-forward" size={20} color="black" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.earningsDetail}
            onPress={() => navigation.navigate("WalletScreen")}
          >
            <View>
              <Text style={styles.detailLabel}>Ví tài khoản</Text>
              {/* <Text style={styles.detailValue}>{formatCurrency(632428)}</Text> */}
            </View>
            <Ionicons name="chevron-forward" size={20} color="black" />
          </TouchableOpacity>
        </View>
      )}
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
  bottomLeftControls: {
    position: "absolute",
    bottom: 200,
    right: 20,
    flexDirection: "column",
  },
  controlButton: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 30,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  loadingText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#555",
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
    fontSize: 16,
    fontWeight: "bold",
  },
  earningsPopup: {
    position: "absolute",
    top: 110,
    left: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,

    width: 250,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  closePopup: {
    position: "absolute",
    top: 5,
    right: 5,
    zIndex: 10,
  },
  earningsDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 10,
    color: "black",
  },
  detailValue: {
    fontSize: 19,
    color: "#4CAF50",
  },
  rewardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default DriverScreen;

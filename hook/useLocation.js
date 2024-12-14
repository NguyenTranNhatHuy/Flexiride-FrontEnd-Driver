import { useState, useEffect, useRef } from "react";
import { Platform, PermissionsAndroid, Alert } from "react-native";
import Geolocation from "@react-native-community/geolocation";

const useLocation = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("Đang lấy vị trí...");
  const [error, setError] = useState(null);
  const watchID = useRef(null);

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === "android") {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: "Quyền truy cập vị trí",
              message: "Ứng dụng cần quyền để truy cập vị trí của bạn",
            }
          );

          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            // Quyền được cấp, lấy vị trí
            getOneTimeLocation();
            subscribeLocation();
          } else {
            setLocationStatus("Quyền truy cập bị từ chối.");
            Alert.alert(
              "Quyền bị từ chối",
              "Bạn cần bật quyền truy cập vị trí trong cài đặt."
            );
          }
        } catch (err) {
          console.error("Lỗi khi yêu cầu quyền:", err);
        }
      } else {
        // iOS không cần quản lý quyền theo cách này
        getOneTimeLocation();
        subscribeLocation();
      }
    };

    requestLocationPermission();

    // Xóa theo dõi vị trí khi unmount
    return () => {
      if (watchID.current) {
        Geolocation.clearWatch(watchID.current);
      }
    };
  }, []);

  // Lấy vị trí hiện tại một lần
  const getOneTimeLocation = () => {
    setLocationStatus("Đang lấy vị trí...");
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        if (accuracy > 50) {
          console.warn("Vị trí không chính xác, độ chính xác > 50m");
        }

        setCurrentLocation({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setLocationStatus("Đã lấy vị trí.");
      },
      (error) => {
        // console.error("Lỗi lấy vị trí lần đầu:", error.message);
        fallbackLowAccuracyLocation();
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
    );
  };

  // Lấy vị trí với độ chính xác thấp nếu lần đầu thất bại
  const fallbackLowAccuracyLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        setCurrentLocation({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setLocationStatus("Đã lấy vị trí với độ chính xác thấp.");
      },
      (fallbackError) => {
        console.error("Lỗi lấy vị trí với độ chính xác thấp:", fallbackError);
        setError(fallbackError.message);
        setLocationStatus("Không thể lấy vị trí.");
      },
      { enableHighAccuracy: false }
    );
  };

  // Theo dõi vị trí khi di chuyển
  const subscribeLocation = () => {
    watchID.current = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        setCurrentLocation({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setLocationStatus("Cập nhật vị trí.");
      },
      (error) => {
        console.error("Lỗi theo dõi vị trí:", error);
        setLocationStatus("Không thể theo dõi vị trí.");
      },
      { enableHighAccuracy: false, distanceFilter: 10 }
    );
  };

  // Hàm để yêu cầu bật quyền vị trí trong cài đặt (chỉ cho Android)
  const openSettings = () => {
    if (Platform.OS === "android") {
      PermissionsAndroid.openSettings();
    } else {
      Alert.alert(
        "Cài đặt vị trí",
        "Hãy bật quyền vị trí trong Cài đặt để tiếp tục sử dụng ứng dụng."
      );
    }
  };

  return {
    currentLocation,
    locationStatus,
    getOneTimeLocation,
    subscribeLocation,
    openSettings,
    error,
  };
};

export default useLocation;

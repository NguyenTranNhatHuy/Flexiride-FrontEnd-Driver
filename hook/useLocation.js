import { useState, useEffect, useRef } from "react";
import { Platform, PermissionsAndroid, Alert, Linking } from "react-native";
import Geolocation from "@react-native-community/geolocation";

const useLocation = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("Đang lấy vị trí...");
  const [error, setError] = useState(null);
  const watchID = useRef(null);

  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        if (Platform.OS === "android") {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: "Quyền truy cập vị trí",
              message: "Ứng dụng cần quyền để truy cập vị trí của bạn",
              buttonNeutral: "Hỏi sau",
              buttonNegative: "Hủy",
              buttonPositive: "Đồng ý",
            }
          );

          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            getOneTimeLocation();
            subscribeLocation();
          } else {
            setLocationStatus("Quyền truy cập vị trí bị từ chối.");
            Alert.alert(
              "Quyền bị từ chối",
              "Ứng dụng cần quyền truy cập vị trí để hoạt động. Vui lòng cấp quyền trong cài đặt.",
              [
                { text: "Hủy", style: "cancel" },
                { text: "Mở cài đặt", onPress: openSettings },
              ]
            );
          }
        } else {
          getOneTimeLocation();
          subscribeLocation();
        }
      } catch (err) {
        console.error("Lỗi khi yêu cầu quyền:", err);
      }
    };

    requestLocationPermission();

    // Cleanup: Stop watching location when the component is unmounted
    return () => {
      if (watchID.current) {
        Geolocation.clearWatch(watchID.current);
      }
    };
  }, []);

  const getOneTimeLocation = () => {
    setLocationStatus("Đang lấy vị trí...");
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        if (accuracy > 50) {
          console.warn("Độ chính xác thấp (>50m), đang tìm vị trí tốt hơn...");
        }

        setCurrentLocation({
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
        setLocationStatus("Đã lấy vị trí.");
      },
      (error) => {
        console.error("Lỗi khi lấy vị trí một lần:", error.message);
        fallbackLowAccuracyLocation();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

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

  const subscribeLocation = () => {
    watchID.current = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        setCurrentLocation({
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
        setLocationStatus("Đã cập nhật vị trí.");
      },
      (error) => {
        console.error("Lỗi theo dõi vị trí:", error.message);
        setLocationStatus("Không thể theo dõi vị trí.");
      },
      { enableHighAccuracy: true, distanceFilter: 5 }
    );
  };

  const openSettings = () => {
    if (Platform.OS === "android") {
      Linking.openSettings();
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

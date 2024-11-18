import { useState, useEffect, useRef } from "react";
import { Platform, PermissionsAndroid } from "react-native";
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
          console.log("Quyền truy cập:", granted); // Log quyền
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            getOneTimeLocation();
            subscribeLocation();
          } else {
            setLocationStatus("Quyền truy cập bị từ chối.");
          }
        } catch (err) {
          console.warn(err);
        }
      } else {
        getOneTimeLocation();
        subscribeLocation();
      }
    };

    requestLocationPermission();

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
        const { latitude, longitude } = position.coords;

        setCurrentLocation({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        console.log("status use location: ", currentLocation);
        setLocationStatus("Đã lấy vị trí.");
      },
      (error) => {
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
            setError(fallbackError.message);
            setLocationStatus("Không thể lấy vị trí.");
          },
          { enableHighAccuracy: false }
        );
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  // Theo dõi vị trí khi di chuyển
  const subscribeLocation = () => {
    watchID.current = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const currentLongitude = JSON.stringify(position.coords.longitude);
        console.log(
          "🚀 ~ getOneTimeLocation ~ currentLongitude:",
          currentLongitude
        );

        //getting the Latitude from the location json
        const currentLatitude = JSON.stringify(position.coords.latitude);
        console.log(
          "🚀 ~ getOneTimeLocation ~ currentLatitude:",
          currentLatitude
        );
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
  return { currentLocation, locationStatus, getOneTimeLocation, error };
};

export default useLocation;

import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Text,
} from "react-native";
import VietmapGL from "@vietmap/vietmap-gl-react-native"; // Import Vietmap
import polyline from "@mapbox/polyline";
import { VIETMAP_API_KEY } from "@env";

const OptimalRouteScreen = ({ route }) => {
  const { driverLocation, pickupPoints } = route.params;
  const [routePoints, setRoutePoints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOptimalRoute();
  }, []);

  const fetchOptimalRoute = async () => {
    const points = [driverLocation, ...pickupPoints]
      .map((point) => `${point.latitude},${point.longitude}`)
      .join("&point=");

    const tspUrl = `https://maps.vietmap.vn/api/tsp?api-version=1.1&apikey=${VIETMAP_API_KEY}&point=${points}&vehicle=car&roundtrip=false`;

    try {
      const response = await fetch(tspUrl);
      const data = await response.json();

      if (data.paths && data.paths.length > 0) {
        const decodedPoints = polyline
          .decode(data.paths[0].points)
          .map(([latitude, longitude]) => [longitude, latitude]);
        setRoutePoints(decodedPoints);
      } else {
        Alert.alert("Lỗi", "Không thể tính toán lộ trình.");
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      Alert.alert("Lỗi", "Không thể kết nối đến API.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <VietmapGL.MapView
        style={styles.map}
        styleURL={`https://maps.vietmap.vn/api/maps/light/styles.json?apikey=${VIETMAP_API_KEY}`}
      >
        <VietmapGL.Camera
          zoomLevel={12}
          centerCoordinate={[driverLocation.longitude, driverLocation.latitude]}
        />

        {/* Vẽ đường đi */}
        {routePoints.length > 0 && (
          <VietmapGL.ShapeSource
            id="routeSource"
            shape={{
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: routePoints,
              },
            }}
          >
            <VietmapGL.LineLayer id="routeLine" style={styles.routeLine} />
          </VietmapGL.ShapeSource>
        )}

        {/* Hiển thị tài xế */}
        <VietmapGL.PointAnnotation
          id="driverMarker"
          coordinate={[driverLocation.longitude, driverLocation.latitude]}
        >
          <View style={styles.markerDriver} />
        </VietmapGL.PointAnnotation>

        {/* Hiển thị các điểm đón */}
        {pickupPoints.map((point, index) => (
          <VietmapGL.PointAnnotation
            key={`pickupPoint-${index}`}
            id={`pickupPoint-${index}`}
            coordinate={[point.longitude, point.latitude]}
          >
            <View style={styles.markerCustomer}>
              <Text style={styles.markerLabel}>{`P${index + 1}`}</Text>
            </View>
          </VietmapGL.PointAnnotation>
        ))}
      </VietmapGL.MapView>

      {/* Nút zoom */}
      <View style={styles.zoomControls}>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={() => adjustZoom(0.5)}
        >
          <Text style={styles.zoomText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={() => adjustZoom(2)}
        >
          <Text style={styles.zoomText}>-</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  function adjustZoom(scale) {
    // Bạn có thể điều chỉnh zoom bằng cách thay đổi Camera state hoặc dùng một hàm cụ thể của Vietmap GL.
    // Vì Vietmap không hỗ trợ trực tiếp `latitudeDelta` hay `longitudeDelta`, bạn sẽ cần điều chỉnh bằng thuộc tính zoomLevel của `VietmapGL.Camera`.
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  routeLine: {
    lineWidth: 4,
    lineColor: "blue",
  },
  markerDriver: {
    width: 10,
    height: 10,
    backgroundColor: "green",
    borderRadius: 5,
  },
  markerCustomer: {
    width: 10,
    height: 10,
    backgroundColor: "red",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  markerLabel: {
    color: "white",
    fontSize: 8,
    fontWeight: "bold",
  },
  zoomControls: {
    position: "absolute",
    bottom: 30,
    right: 10,
    flexDirection: "column",
  },
  zoomButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: "center",
  },
  zoomText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default OptimalRouteScreen;

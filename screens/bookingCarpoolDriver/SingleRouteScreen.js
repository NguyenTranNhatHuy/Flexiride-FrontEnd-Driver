import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Alert } from "react-native";
// import MapboxGL from "@rnmapbox/maps";
import polyline from "@mapbox/polyline";
import { VIETMAP_API_KEY } from "@env";
import VietmapGL from "@vietmap/vietmap-gl-react-native"; // Import Vietmap

// MapboxGL.setAccessToken(VIETMAP_API_KEY);

const SingleRouteScreen = ({ route }) => {
  const { driverCoordinates, customerCoordinates } = route.params;
  const [routePoints, setRoutePoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);

  useEffect(() => {
    fetchRoute();
  }, []);

  const fetchRoute = async () => {
    const tspUrl = `https://maps.vietmap.vn/api/tsp?api-version=1.1&apikey=${VIETMAP_API_KEY}&point=${driverCoordinates.latitude},${driverCoordinates.longitude}&point=${customerCoordinates.latitude},${customerCoordinates.longitude}&vehicle=car&roundtrip=false`;

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
        ref={mapRef}
        style={{ flex: 1 }}
        styleURL={`https://maps.vietmap.vn/api/maps/light/styles.json?apikey=${VIETMAP_API_KEY}`}
      >
        <VietmapGL.Camera
          zoomLevel={12}
          centerCoordinate={[
            driverCoordinates.longitude,
            driverCoordinates.latitude,
          ]}
        />

        {/* Vẽ lộ trình */}
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

        {/* Marker tài xế */}
        <VietmapGL.PointAnnotation
          id="driverMarker"
          coordinate={[driverCoordinates.longitude, driverCoordinates.latitude]}
        >
          <View style={styles.markerDriver} />
        </VietmapGL.PointAnnotation>

        {/* Marker khách hàng */}
        <VietmapGL.PointAnnotation
          id="customerMarker"
          coordinate={[
            customerCoordinates.longitude,
            customerCoordinates.latitude,
          ]}
        >
          <View style={styles.markerCustomer} />
        </VietmapGL.PointAnnotation>
      </VietmapGL.MapView>
    </View>
  );
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
  },
});

export default SingleRouteScreen;

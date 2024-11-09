import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import axios from "axios";
import polyline from "@mapbox/polyline";
import { VIETMAP_API_KEY } from "@env";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";

const VietMapNavigationScreen = ({ route, navigation }) => {
  const { pickupLocation, destinationLocation } = route.params;
  const [currentLocation, setCurrentLocation] = useState(pickupLocation);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);

  useEffect(() => {
    requestLocationPermission();
    const interval = setInterval(updateCurrentLocation, 5000); // Fetch every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      updateCurrentLocation(); // Initial fetch
    } else {
      alert("Location permission denied");
    }
  };

  const updateCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setCurrentLocation(newLocation);
      // calculateRoute(newLocation, destinationLocation);
      console.log("api running");
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  const calculateRoute = async (startLocation, endLocation) => {
    try {
      const response = await axios.get(
        `https://maps.vietmap.vn/api/route?api-version=1.1&apikey=${VIETMAP_API_KEY}&point=${startLocation.latitude},${startLocation.longitude}&point=${endLocation.latitude},${endLocation.longitude}&vehicle=car&points_encoded=true`
      );
      const { paths } = response.data;
      if (paths && paths.length > 0) {
        const routePath = paths[0];
        const decodedCoordinates = polyline
          .decode(routePath.points)
          .map(([latitude, longitude]) => ({ latitude, longitude }));
        setRouteCoordinates(decodedCoordinates);
        setDistance((routePath.distance / 1000).toFixed(1) + " km");
        setDuration(Math.round(routePath.time / 60000) + " min");
      }
    } catch (error) {
      console.error("Failed to fetch route data", error);
    }
  };

  const handleRecenter = () => {
    setCurrentLocation(pickupLocation); // Reset to initial location if needed
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Navigation Info Header */}
      <View style={styles.infoHeader}>
        <Text style={styles.roadText}>
          Towards {destinationLocation.address}
        </Text>
        <Text style={styles.infoText}>
          {distance} • {duration}
        </Text>
      </View>

      {/* Map View */}
      <MapView
        style={styles.map}
        region={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
      >
        <Marker coordinate={pickupLocation} title="Điểm đón" />
        <Marker coordinate={destinationLocation} title="Điểm đến" />
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={4}
            strokeColor="blue"
          />
        )}
      </MapView>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={handleRecenter}>
          <Ionicons name="locate" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoHeader: {
    backgroundColor: "#2e7d32",
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  roadText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  infoText: {
    color: "white",
    fontSize: 16,
    marginTop: 5,
  },
  map: {
    flex: 1,
  },
  controls: {
    position: "absolute",
    top: "20%",
    right: 10,
    alignItems: "center",
  },
  controlButton: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 50,
    marginVertical: 5,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
});

export default VietMapNavigationScreen;

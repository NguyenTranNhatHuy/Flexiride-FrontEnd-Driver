import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Text } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import polyline from '@mapbox/polyline';
import { VIETMAP_API_KEY } from '@env';

const OptimalRouteScreen = ({ route }) => {
  const { driverLocation, pickupPoints } = route.params;
  const [routePoints, setRoutePoints] = useState([]);
  const [loading, setLoading] = useState(true);

  const [mapRegion, setMapRegion] = useState({
    latitude: driverLocation.latitude,
    longitude: driverLocation.longitude,
    latitudeDelta: 0.05, // Độ rộng bản đồ ban đầu
    longitudeDelta: 0.05,
  });

  useEffect(() => {
    fetchOptimalRoute();
  }, []);

  const fetchOptimalRoute = async () => {
    const points = [driverLocation, ...pickupPoints]
      .map(point => `${point.latitude},${point.longitude}`)
      .join('&point=');

    const tspUrl = `https://maps.vietmap.vn/api/tsp?api-version=1.1&apikey=${VIETMAP_API_KEY}&point=${points}&vehicle=car&roundtrip=false`;

    try {
      const response = await fetch(tspUrl);
      const data = await response.json();

      if (data.paths && data.paths.length > 0) {
        const decodedPoints = polyline.decode(data.paths[0].points).map(([latitude, longitude]) => ({ latitude, longitude }));
        setRoutePoints(decodedPoints);
      } else {
        Alert.alert('Lỗi', 'Không thể tính toán lộ trình.');
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      Alert.alert('Lỗi', 'Không thể kết nối đến API.');
    } finally {
      setLoading(false);
    }
  };

  const handleZoomIn = () => {
    setMapRegion(prevRegion => ({
      ...prevRegion,
      latitudeDelta: prevRegion.latitudeDelta / 2,
      longitudeDelta: prevRegion.longitudeDelta / 2,
    }));
  };

  const handleZoomOut = () => {
    setMapRegion(prevRegion => ({
      ...prevRegion,
      latitudeDelta: prevRegion.latitudeDelta * 2,
      longitudeDelta: prevRegion.longitudeDelta * 2,
    }));
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
      <MapView
        style={styles.map}
        region={mapRegion}
        onRegionChangeComplete={(region) => setMapRegion(region)}
      >
        {/* Vẽ đường đi */}
        <Polyline coordinates={routePoints} strokeWidth={4} strokeColor="blue" />
        {/* Hiển thị tài xế */}
        <Marker
          coordinate={driverLocation}
          title="Tài xế"
          pinColor="green"
        />
        {/* Hiển thị các điểm đón */}
        {pickupPoints.map((point, index) => (
          <Marker
            key={index}
            coordinate={point}
            title={`Điểm đón ${index + 1}`}
            pinColor="red"
          />
        ))}
      </MapView>

      {/* Nút zoom */}
      <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn}>
          <Text style={styles.zoomText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut}>
          <Text style={styles.zoomText}>-</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomControls: {
    position: 'absolute',
    bottom: 30,
    right: 10,
    flexDirection: 'column',
  },
  zoomButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  zoomText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default OptimalRouteScreen;

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import polyline from '@mapbox/polyline';
import { VIETMAP_API_KEY } from '@env';

const SingleRouteScreen = ({ route }) => {
  const { driverCoordinates, customerCoordinates } = route.params;
  const [routePoints, setRoutePoints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoute();
  }, []);

  const fetchRoute = async () => {
    const tspUrl = `https://maps.vietmap.vn/api/tsp?api-version=1.1&apikey=${VIETMAP_API_KEY}&point=${driverCoordinates.latitude},${driverCoordinates.longitude}&point=${customerCoordinates.latitude},${customerCoordinates.longitude}&vehicle=car&roundtrip=false`;

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: driverCoordinates.latitude,
        longitude: driverCoordinates.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    >
      {/* Vẽ lộ trình */}
      <Polyline coordinates={routePoints} strokeWidth={4} strokeColor="blue" />
      {/* Marker tài xế */}
      <Marker
        coordinate={driverCoordinates}
        title="Tài xế"
        pinColor="green"
      />
      {/* Marker khách hàng */}
      <Marker
        coordinate={customerCoordinates}
        title="Khách hàng"
        pinColor="red"
      />
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SingleRouteScreen;

import VietMapNavigation from "@vietmap/vietmap-react-native-navigation";
import React, { useEffect, useMemo } from "react";
import { View, StyleSheet, Alert } from "react-native";

const VietMapNavigationScreen = ({ route, navigation }) => {
  const { pickupLocation, destinationLocation } = route.params;

  useEffect(() => {
    if (!pickupLocation || !destinationLocation) {
      Alert.alert("Error", "Missing navigation coordinates.");
      navigation.goBack();
    }
  }, [pickupLocation, destinationLocation, navigation]);

  const initialLatLngZoom = useMemo(
    () => ({
      lat: pickupLocation?.latitude,
      long: pickupLocation?.longitude,
      zoom: 17,
    }),
    [pickupLocation]
  );

  const destinationLatLng = useMemo(
    () => ({
      lat: destinationLocation?.latitude,
      long: destinationLocation?.longitude,
    }),
    [destinationLocation]
  );

  const handleArrival = () => {
    Alert.alert("Arrival", "You have reached your destination.");
  };

  const handleCancel = () => {
    Alert.alert("Navigation", "Navigation canceled.");
  };

  return (
    <View style={styles.container}>
      {pickupLocation && destinationLocation && (
        <VietMapNavigation
          apiKey={"7c3ab066a578a4f5fe4f40c67573f7e0a831f9b36adfdc48"}
          initialLatLngZoom={initialLatLngZoom}
          destinationLatLng={destinationLatLng}
          shouldSimulateRoute={false}
          navigationZoomLevel={17}
          onRouteProgressChange={(event) =>
            console.log("Navigation progress:", event.nativeEvent?.data)
          }
          onArrival={handleArrival}
          onCancelNavigation={handleCancel}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default VietMapNavigationScreen;

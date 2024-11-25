// screens/ServiceSelectionScreen.js
import React from 'react';
import { View, Button, Text } from 'react-native';

export const ServiceSelectionScreen = ({ navigation }) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Driver</Text>

      <Button
        title="Nhận chuyến xe ghép"
        onPress={() => navigation.navigate('DriverAvailableRides')}
      />     
       
      <Button
        title="quản lý các chuyến"
        onPress={() => navigation.navigate('ManageDriverRides')}
      />     
    </View>
  );
};

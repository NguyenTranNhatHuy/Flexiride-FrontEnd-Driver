import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const ServiceSelectionScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chọn Dịch Vụ</Text>
      
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('DriverAvailableRides')}
      >
        <Text style={styles.buttonText}>Nhận chuyến xe ghép</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ManageDriverRides')}
      >
        <Text style={styles.buttonText}>Quản lý các chuyến</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5', // Nền nhạt
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333', // Màu chữ chính
  },
  button: {
    backgroundColor: '#007BFF', // Màu xanh cho nút
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // Hiệu ứng nổi
  },
  buttonText: {
    color: '#fff', // Màu chữ trắng
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

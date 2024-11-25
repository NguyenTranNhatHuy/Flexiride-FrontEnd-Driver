// screens/DriverAvailableRidesScreen.js
import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { getDriverAvailableRides, acceptCarpoolRequest } from '../../service/BookingCarpoolApi';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const DriverAvailableRidesScreen = ({ navigation }) => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    setLoading(true);
    try {
      const response = await getDriverAvailableRides();
      setRides(response.data);
    } catch (error) {
      console.error('Error fetching available rides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setAccepting(requestId);
    try {
      console.log("RequestID: ", requestId);
      await acceptCarpoolRequest(requestId);
      navigation.navigate('ManageDriverRides');
    } catch (error) {
      console.error('Error accepting the request:', error);
    } finally {
      setAccepting(null);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date)) throw new Error('Invalid Date');
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (error) {
      console.error('Error formatting date:', error.message);
      return 'Invalid Date';
    }
  };

  const formatTime = (timeString) => {
    try {
      // Loại bỏ ký tự ":00" không cần thiết và khoảng trắng
      const cleanedTimeString = timeString.replace(/\s*:\d{2}$/, '').trim();

      // Kiểm tra xem có chứa AM/PM không
      const isPM = cleanedTimeString.toLowerCase().includes('pm');
      const isAM = cleanedTimeString.toLowerCase().includes('am');

      // Loại bỏ AM/PM nếu có
      const timeWithoutMeridiem = cleanedTimeString.replace(/am|pm/gi, '').trim();

      // Tách giờ và phút
      const [hours, minutes] = timeWithoutMeridiem.split(':').map((t) => parseInt(t, 10));

      if (isNaN(hours) || isNaN(minutes)) throw new Error('Invalid Time Format');

      // Chuyển đổi giờ sang định dạng 24 giờ nếu cần
      let formattedHours = hours;
      if (isPM && hours < 12) formattedHours += 12;
      if (isAM && hours === 12) formattedHours = 0;

      // Đảm bảo giờ và phút hiển thị 2 chữ số
      const formattedTime = `${formattedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      return formattedTime;
    } catch (error) {
      console.error('Error formatting time:', error.message);
      return 'Invalid Time';
    }
  };



  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading available rides...</Text>
      </View>
    );
  }

  const renderRideCard = (item) => (
    <View style={styles.card}>
      {/* Chia thành hai phần: trái và phải */}
      <View style={styles.leftSection}>
        <Text style={styles.rideInfo}>Đi từ: {item.start_location}</Text>
        <Text style={styles.rideInfo}>Đến: {item.end_location}</Text>
        <Text style={styles.rideInfo}>Ngày Xuất phát: {formatDate(item.date)}</Text>
        <Text style={styles.rideInfo}>Thời gian xuất phát: {item.time_start}</Text>
        <Text style={styles.rideInfo}>Giá: {formatPrice(item.price)} VNĐ</Text>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleAcceptRequest(item.id)}
          disabled={accepting === item.id}
        >
          <Text style={styles.buttonText}>
            {accepting === item.id ? 'Processing...' : 'Nhận chuyến'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.rightSection}>
        <Icon name="account-multiple" size={40} color="#4CAF50" />
        <Text style={styles.numberCustomerText}>{item.numberCustomer} khách</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {rides.length === 0 ? (
        <Text style={styles.noRidesText}>No available rides at the moment.</Text>
      ) : (
        <FlatList
          data={rides}
          keyExtractor={(item, index) => (item.id ? item.id : index.toString())}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {/* Chia card thành hai phần */}
              <View style={styles.leftSection}>
                <Text style={styles.rideInfo}>Đi từ: {item.start_location}</Text>
                <Text style={styles.rideInfo}>Đến: {item.end_location}</Text>
                <Text style={styles.rideInfo}>Ngày Xuất phát: {formatDate(item.date)}</Text>
                <Text style={styles.rideInfo}>Thời gian xuất phát: {formatTime(item.time_start)}</Text>
                <Text style={styles.rideInfo}>Giá: {formatPrice(item.price)} VNĐ</Text>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => handleAcceptRequest(item.id)}
                  disabled={accepting === item.id}
                >
                  <Text style={styles.buttonText}>
                    {accepting === item.id ? 'Processing...' : 'Nhận chuyến'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.rightSection}>
                {/* Hiển thị số khách và biểu tượng */}
                <Icon name="account-multiple" size={40} color="#4CAF50" />
                <Text style={styles.numberCustomerText}>{item.numberCustomer} khách</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );

};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', // Chia thành hai cột
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  leftSection: {
    flex: 7, // Chiếm 70% chiều rộng
    paddingRight: 10,
  },
  rightSection: {
    flex: 3, // Chiếm 30% chiều rộng
    justifyContent: 'center',
    alignItems: 'center',
  },
  rideInfo: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  numberCustomerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 5,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

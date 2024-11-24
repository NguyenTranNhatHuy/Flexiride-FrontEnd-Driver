import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location';
import { updatePickupProgress, getCustomerStatusPickup, updateStartStatusRequest, updateCompleteStatusRequest } from '../../service/BookingCarpoolApi';
import { VIETMAP_API_KEY } from '@env';

export const PickupProgressScreen = ({ route }) => {
  const { rideInfor } = route.params;
  const [loading, setLoading] = useState(false);
  const [rides, setRides] = useState([]);
  const [rideStatus, setRideStatus] = useState(rideInfor.status);

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    setLoading(true);
    try {
      const response = await getCustomerStatusPickup(rideInfor._id);
      setRides(response.data.list_customer);
    } catch (error) {
      console.error('Error fetching driver rides:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerCoordinates = async (address) => {
    console.log("================search======================")
    const url = `https://maps.vietmap.vn/api/search/v3?apikey=${VIETMAP_API_KEY}&focus=10.75887508,106.67538868&text=Công Ty Cổ Phần Ứng Dụng Bản Đồ Việt,HCM`;


    
    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log("serach: ", data);

      if (data.length > 0) {
        return {
          latitude: data[0].location.lat,
          longitude: data[0].location.lng,
        };
      }
    } catch (error) {
      console.error('Error fetching coordinates from address:', error);
    }
    return null;
  };

  const handlePickupCustomer = (customerId) => {
    updatePickupProgress(rideInfor._id, customerId)
      .then(() => {
        alert('Đã cập nhật trạng thái đón khách!');
        setRides((prevRides) =>
          prevRides.map((customer) =>
            customer.account_id._id === customerId ? { ...customer, pickedUp: true } : customer
          )
        );
      })
      .catch((err) => console.log(err));
  };

  const handleStartTrip = () => {
    updateStartStatusRequest(rideInfor._id)
      .then(() => {
        setRideStatus('ongoing');
      })
      .catch((err) => {
        console.log(err);
        alert('Có lỗi xảy ra khi bắt đầu chuyến xe. Vui lòng thử lại!');
      });
  };

  const handleCompleteTrip = () => {
    updateCompleteStatusRequest(rideInfor._id)
      .then(() => {
        setRideStatus('completed');
        fetchRides();
      })
      .catch((err) => {
        console.log(err);
        alert('Có lỗi xảy ra khi kết thúc chuyến xe. Vui lòng thử lại!');
      });
  };

  const handleNavigate = async (customerAddress) => {
    const customerCoordinates = {
      name: customerAddress.account_id.name,
      latitude: customerAddress.latitude,
      longitude: customerAddress.longitude,
    }
    console.log("rideInfor: ",rideInfor)

    console.log("rideInfor: ",customerCoordinates)
    // const customerCoordinates = await fetchCustomerCoordinates(customerAddress);
    // if (!customerCoordinates) {
    //   Alert.alert('Lỗi', 'Không thể tìm thấy vị trí khách hàng.');
    //   return;
    // }

    // let { status } = await Location.requestForegroundPermissionsAsync();
    // if (status !== 'granted') {
    //   Alert.alert('Lỗi', 'Quyền truy cập vị trí bị từ chối.');
    //   return;
    // }

    // const location = await Location.getCurrentPositionAsync({});
    // const driverCoordinates = {
    //   latitude: location.coords.latitude,
    //   longitude: location.coords.longitude,
    // };

    // const tspUrl = `https://maps.vietmap.vn/api/tsp?api-version=1.1&apikey=${VIETMAP_API_KEY}&point=${driverCoordinates.latitude},${driverCoordinates.longitude}&point=${customerCoordinates.latitude},${customerCoordinates.longitude}&roundtrip=false`;

    // try {
    //   const response = await fetch(tspUrl);
    //   const data = await response.json();

    //   if (data.paths && data.paths.length > 0) {
    //     const routePoints = data.paths[0].points;

    //     // navigation.navigate('PickupCustomerMap', {
    //     //   customerLocation: customerCoordinates,
    //     //   driverLocation: driverCoordinates,
    //     //   routePoints: routePoints,
    //     // });
    //     console.log("================navigating======================")
    //     console.log("customerCoordinates: ", customerCoordinates)
    //     console.log("driverCoordinates: ", driverCoordinates)
    //     console.log("routePoints: ", routePoints)
    //   } else {
    //     Alert.alert('Lỗi', 'Không thể tính toán lộ trình đến khách hàng.');
    //   }
    // } catch (error) {
    //   console.error('Error calculating route:', error);
    // }
  };
  

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN');
  const formatTime = (timeString) => new Date(timeString).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const formatPrice = (price) => price.toLocaleString('vi-VN');

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading ride details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.rideDetails}>
        <Text style={styles.customerInfo}>ID: <Text style={styles.highlightText}>{rideInfor._id}</Text></Text>
        <Text style={styles.detailText}>Đi từ: <Text style={styles.highlightText}>{rideInfor.start_location}</Text></Text>
        <Text style={styles.detailText}>Đến: <Text style={styles.highlightText}>{rideInfor.end_location}</Text></Text>
        <Text style={styles.detailText}>Ngày: <Text style={styles.highlightText}>{formatDate(rideInfor.date)}</Text></Text>
        <Text style={styles.detailText}>Thời gian: <Text style={styles.highlightText}>{formatTime(rideInfor.time_start)}</Text></Text>
        <Text style={styles.detailText}>Giá: <Text style={styles.priceText}>{formatPrice(rideInfor.price)} VNĐ</Text></Text>
        <Text style={styles.detailText}>Trạng thái: <Text style={{ color: '#4CAF50' }}>{rideStatus}</Text></Text>

        {rideStatus === 'accepted' && (
          <TouchableOpacity style={styles.navigateButton} onPress={handleStartTrip}>
            <Text style={styles.buttonText}>Lẹt gô</Text>
          </TouchableOpacity>
        )}

        {rideStatus === 'ongoing' && (
          <TouchableOpacity style={styles.navigateButton} onPress={handleCompleteTrip}>
            <Text style={styles.buttonText}>Kết thúc chuyến</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={rides || []}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.customerInfo}>Khách: <Text style={styles.highlightText}>{item.account_id.name}</Text></Text>
            <Text style={styles.customerInfo}>Số điện thoại: <Text style={styles.highlightText}>{item.account_id.phone}</Text></Text>
            <Text style={styles.customerInfo}>Địa chỉ: <Text style={styles.highlightText}>{item.location}</Text></Text>
            <Text style={styles.statusText}>
              Trạng thái:
              <Text style={{ color: item.pickedUp ? '#4CAF50' : '#F44336' }}>
                {item.pickedUp ? ' Đã đón' : ' Chưa đón'}
              </Text>
            </Text>
            {rideStatus !== 'completed' && !item.pickedUp && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.pickupButton} onPress={() => handlePickupCustomer(item.account_id._id)}>
                  <Text style={styles.buttonText}>Đã đón</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navigateButton} onPress={() => handleNavigate(item)}>
                  <Text style={styles.buttonText}>Chỉ đường</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f8ff',
  },
  rideDetails: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  highlightText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  priceText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  customerInfo: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  statusText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickupButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  navigateButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
});

export default PickupProgressScreen;

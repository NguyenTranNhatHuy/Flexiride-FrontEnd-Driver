import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Switch,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import axios from "axios";
import { IP_ADDRESS } from "@env";
import { useAuth } from "../provider/AuthProvider";

const ServiceScreen = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const { authState } = useAuth();

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `http://${IP_ADDRESS}:3000/driver/${authState.userId}/services-active`
      );

      if (!response.data.data) {
        setServices([]);
      } else {
        setServices(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching services:", err);
      setError("Không thể tải danh sách dịch vụ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const toggleSwitch = (serviceId) => {
    setServices((prevState) =>
      prevState.map((service) =>
        service._id === serviceId
          ? { ...service, isActive: !service.isActive }
          : service
      )
    );
  };

  const handleSaveActiveServices = async () => {
    const activeServices = services
      .filter((service) => service.isActive)
      .map((service) => service._id);

    if (activeServices.length === 0) {
      Alert.alert("Lỗi", "Bạn phải bật ít nhất một dịch vụ.");
      return;
    }

    try {
      await axios.post(
        `http://${IP_ADDRESS}:3000/driver/${authState.userId}/update-active-services`,
        { activeServices }
      );
      Alert.alert("Thành công", "Danh sách dịch vụ đã được cập nhật.");
    } catch (error) {
      console.error("Error updating active services:", error);
      Alert.alert("Lỗi", "Không thể cập nhật danh sách dịch vụ.");
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchServices();
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Đang tải danh sách dịch vụ...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchServices}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <Text style={styles.header}>Danh sách dịch vụ</Text>
      {services.length > 0 ? (
        services.map((service) => (
          <View key={service._id} style={styles.serviceCard}>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceDescription}>
                {service.description}
              </Text>
            </View>
            <Switch
              value={service.isActive}
              onValueChange={() => toggleSwitch(service._id)}
            />
          </View>
        ))
      ) : (
        <Text style={styles.noServiceText}>
          Hiện tại bạn chưa bật dịch vụ nào.
        </Text>
      )}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSaveActiveServices}
      >
        <Text style={styles.saveButtonText}>Lưu Dịch Vụ</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#555",
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  errorText: {
    fontSize: 16,
    color: "#d32f2f",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  serviceCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  serviceInfo: {
    flex: 1,
    marginRight: 16,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  serviceDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  noServiceText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ServiceScreen;

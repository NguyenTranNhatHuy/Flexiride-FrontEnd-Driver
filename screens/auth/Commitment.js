import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Commitment = ({ navigation }) => {
  const [checkboxes, setCheckboxes] = useState({
    checkbox1: false,
    checkbox2: false,
    checkbox3: false,
    checkbox4: false,
    checkbox5: false,
    checkbox6: false,
  });

  // Retrieve commitment data from AsyncStorage when the component mounts
  useEffect(() => {
    const loadCommitmentData = async () => {
      try {
        const committedData = await AsyncStorage.getItem("committed");
        if (committedData) {
          setCheckboxes(JSON.parse(committedData)); // Set checkbox state from stored data
        }
      } catch (error) {
        console.error("Error loading commitment data:", error);
      }
    };

    loadCommitmentData();
  }, []);

  // Hàm xử lý khi checkbox được bấm
  const toggleCheckbox = (key) => {
    setCheckboxes((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  // Hàm kiểm tra tất cả các checkbox có được tick hay không
  const areAllCheckboxesChecked = () => {
    return Object.values(checkboxes).every((value) => value === true);
  };

  // Hàm xử lý lưu thông tin
  const handleSave = async () => {
    if (areAllCheckboxesChecked()) {
      try {
        await AsyncStorage.setItem("committed", JSON.stringify(checkboxes));
        navigation.navigate("PersonalInformation"); // Điều hướng đến màn hình tiếp theo
      } catch (error) {
        console.error("Error saving commitment data:", error);
        Alert.alert("Lỗi", "Có lỗi xảy ra khi lưu cam kết.");
      }
    } else {
      Alert.alert("Cảnh báo", "Bạn phải cam kết tất cả thông tin trước khi tiếp tục.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "android" ? "height" : "padding"}
    >
      {/* Nút Back */}
      <TouchableOpacity style={styles.backButton}>
        <Icon
          onPress={() => navigation.navigate("PersonalInformation")}
          name="arrow-left"
          size={20}
          color="black"
        />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.headerText}>Cam kết</Text>

        {/* Các checkbox */}
        {Object.keys(checkboxes).map((key, index) => (
          <View style={styles.checkboxContainer} key={index}>
            <TouchableOpacity
              onPress={() => toggleCheckbox(key)}
              style={styles.checkbox}
            >
              <View style={styles.checkboxBox}>
                {checkboxes[key] && (
                  <Icon name="check" size={16} color="green" /> // Hiển thị dấu tick khi được chọn
                )}
              </View>
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>
              {getCheckboxLabel(key)}{" "}
              {/* Gọi hàm để lấy nội dung cho từng checkbox */}
            </Text>
          </View>
        ))}

        {/* Save Button */}
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Lưu</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Hàm để lấy nội dung cho từng checkbox
const getCheckboxLabel = (key) => {
  const labels = {
    checkbox1:
      "Tôi có và sẽ duy trì giấy phép lái xe còn hiệu lực trong suốt quá trình hoạt động FRide",
    checkbox2: "Tôi không có/ không còn án tích tại thời điểm tham gia FRide",
    checkbox3: "Tôi đang không bị điều tra trong giai đoạn khởi tố, truy tố",
    checkbox4:
      "Tôi cam kết đủ sức khoẻ để điều khiển phương tiện giao thông trên đường",
    checkbox5:
      "Tôi đồng ý FRide có thể kiểm tra hồ sơ cá nhân và sử lý nếu tôi cung cấp thông tin không đúng, sai sự thật (Bao gồm việc nhưng hợp tác vĩnh viễn)",
    checkbox6:
      "Tôi đồng ý thông tin số điện thoại của tôi sẽ được cung cấp cho khách hàng FRide",
  };
  return labels[key];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFC323",
    alignItems: "stretch",
    justifyContent: "flex-start",
    paddingTop: 30,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
    padding: 10,
    marginTop: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "justify",
    marginBottom: 50,
    marginTop: 20,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    flexWrap: "wrap",
  },
  checkbox: {
    marginRight: 10,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "black",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#333",
    flexShrink: 1,
    flex: 1,
  },
  saveButton: {
    backgroundColor: "#270C6D",
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "center",
    marginTop: 5,
    marginLeft:260
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
  },
});

export default Commitment;

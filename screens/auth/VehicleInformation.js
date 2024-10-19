import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome"; // Thêm thư viện icon

const VehicleInformation = ({ route, navigation }) => {

  const handleNavigation = (item) => {
    switch (item) {
      case "Hình xe":
          navigation.navigate("CarImage");
        break;
      case "Giấy đăng ký xe":
        navigation.navigate("VehicleRegistration", );
        break;
      case "Bảo hiểm xe":
        navigation.navigate("CarInsurance");
        break;
      default:
        break;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "android" ? "height" : null}
    >
      {/* Nút Back */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-left" size={20} color="black" />
      </TouchableOpacity>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerText}>Thông tin cá nhân</Text>

        {/* Các mục thông tin cá nhân */}
        {[
          "Hình xe",
          "Giấy đăng ký xe",
          "Bảo hiểm xe",
        ].map((item, index) => (
          <View style={styles.itemContainer} key={index}>
            <Text style={styles.itemText}>
              {index + 1}/ {item}
            </Text>
            <TouchableOpacity
              style={styles.requiredButton}
              onPress={() => handleNavigation(item)}
              disabled={item === "Ảnh Chân Dung" && PortraitCompleted} // Disable if portrait completed
            >
              <Text
                style={[
                  styles.requiredButtonText,
                  item === "Ảnh Chân Dung" && PortraitCompleted
                    ? { color: "green" } // Change color to green if completed
                    : { color: "red" },
                ]}
              >
                {item === "Ảnh Chân Dung" && PortraitCompleted
                  ? "Hoàn thành"
                  : "Bắt buộc"}
              </Text>
              <Icon
                name="chevron-right"
                size={14}
                color="#000"
                style={styles.icon}
              />
            </TouchableOpacity>
          </View>
        ))}

        {/* Nút tiếp tục */}
        <TouchableOpacity
          onPress={() => navigation.navigate("ProfileApproval")}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Tiếp tục</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFC323",
    alignItems: "stretch",
    justifyContent: "flex-start",
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 20,
    marginTop: 20,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    padding: 5,
    borderBottomWidth: 1, // Border bottom
    borderBottomColor: "#000", // Màu của border bottom
  },
  itemText: {
    fontSize: 16,
    color: "#000",
    flex: 1,
    fontWeight: "bold",
  },
  requiredButton: {
    flexDirection: "row", // Đặt flexDirection để icon nằm cùng hàng với text
    alignItems: "center", // Canh giữa các mục trong button
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  requiredButtonText: {
    fontSize: 14,
    marginRight: 5, // Tạo khoảng cách giữa text và icon
  },
  button: {
    backgroundColor: "#270C6D",
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 30,
    alignSelf: "flex-end",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
    marginTop: 10,
  },
});

export default VehicleInformation;

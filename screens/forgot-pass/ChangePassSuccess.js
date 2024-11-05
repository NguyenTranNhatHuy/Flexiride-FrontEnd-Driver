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
import Icon from "react-native-vector-icons/FontAwesome";

const ChangePassSuccess = ({ navigation }) => {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "android" ? "height" : null}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.headerText}>
          Mật khẩu của bạn đã được cập nhật thành công!
        </Text>

        {/* Steps for the user */}
        <View style={styles.stepContainer}>
          <View style={styles.stepItem}>
            <Icon name="check-circle" size={20} color="green" />
            <Text style={styles.stepText}>Mật khẩu đã được thay đổi</Text>
          </View>
          <View style={styles.stepItem}>
            <Icon name="check-circle" size={20} color="green" />
            <Text style={styles.stepText}>Bạn có thể sử dụng mật khẩu mới</Text>
          </View>
        </View>

        {/* Button to navigate to Login */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.buttonText}>Đăng nhập ngay</Text>
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
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "justify",
    marginBottom: 30,
    marginTop: 20,
  },
  stepContainer: {
    marginBottom: 30,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  stepText: {
    fontSize: 16,
    marginLeft: 10,
    fontWeight: "bold",
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#6C6A6A",
    marginRight: 10,
    backgroundColor: "#FFF", // Background for uncompleted steps
  },
  button: {
    backgroundColor: "#270C6D",
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "center",
    marginLeft: 170,
    paddingHorizontal: 40,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});

export default ChangePassSuccess;

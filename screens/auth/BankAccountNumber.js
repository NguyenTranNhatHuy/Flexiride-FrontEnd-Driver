import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome"; // Thêm thư viện icon

//12. tài khoản ngân hàng
const BankAccountNumber = ({route, navigation}) => {
  // State quản lý trạng thái checkbox
  const [isChecked, setIsChecked] = useState(false);

  // Hàm xử lý khi checkbox được bấm
  const toggleCheckbox = () => {
    setIsChecked(!isChecked);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "android" ? "height" : "padding"}
    >
      {/* Nút Back */}
      <TouchableOpacity style={styles.backButton}>
        <Icon
          onPress={() =>
            navigation.navigate("PersonalInformation", {
              //   PortraitCompleted: route.params.PortraitCompleted,
            })
          }
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
        <Text style={styles.headerText}>Tài khoản ngân hàng</Text>

        {/* Bank account Inputs */}
        <TextInput
          style={styles.input}
          placeholder="Tên chủ tài khoản *"
          placeholderTextColor="#999"
          autoCapitalize="words"
          returnKeyType="next"
        />
        <TextInput
          style={styles.input}
          placeholder="Số tài khoản *"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          returnKeyType="done"
        />
        <TextInput
          style={styles.input}
          placeholder="Tên ngân hàng *"
          placeholderTextColor="#999"
          autoCapitalize="words"
          returnKeyType="next"
        />

        {/* Checkbox */}
        <View style={styles.checkboxContainer}>
          <TouchableOpacity onPress={toggleCheckbox} style={styles.checkbox}>
            <View style={styles.checkboxBox}>
              {isChecked && (
                <Icon name="check" size={16} color="green" /> // Hiển thị dấu tick khi được chọn
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.checkboxLabel}>
            Tôi cam kết cung cấp thông tin tài khoản ngân hàng chính chủ của tôi
          </Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Lưu</Text>
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
    marginBottom: 80,
    marginTop: 20,
  },
  input: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
    color: "#000",
    borderWidth: 1, // Độ rộng của viền
    borderColor: "black", // Màu viền
    elevation: 5, // Đổ bóng dành cho Android
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    flexWrap: "wrap", // Cho phép text xuống dòng
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
    flexShrink: 1, // Co giãn để text không tràn ra ngoài
    flex: 1, // Cho phép text chiếm phần còn lại của dòng
  },
  saveButton: {
    backgroundColor: "#270C6D",
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "center",
    marginLeft: 260,
    marginTop: 5,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
    padding: 10,
    marginTop: 10,
  },
});

export default BankAccountNumber;

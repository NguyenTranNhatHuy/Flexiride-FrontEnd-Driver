import React, { useEffect, useState } from "react";
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
import Icon from "react-native-vector-icons/FontAwesome";
import RNPickerSelect from "react-native-picker-select";
import AsyncStorage from "@react-native-async-storage/async-storage";

const EmergencyContact = ({ navigation }) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [contactName, setContactName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((response) => response.json())
      .then((data) => setProvinces(data))
      .catch((error) => console.error("Error fetching provinces:", error));

    // Load saved data from AsyncStorage
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      const savedEmergencyContact = await AsyncStorage.getItem("emergencyContact");
      const savedAddress = await AsyncStorage.getItem("address");

      if (savedEmergencyContact) {
        const { fullName, relationship, phoneNumber } = JSON.parse(savedEmergencyContact);
        setContactName(fullName);
        setRelationship(relationship);
        setPhoneNumber(phoneNumber);
      }

      if (savedAddress) {
        const { streetNumber, ward, district, city } = JSON.parse(savedAddress);
        setHouseNumber(streetNumber);
        setSelectedProvince(city);
        
        // Fetch and set districts and wards if there is saved data for district and ward
        if (city) fetchDistricts(city, district);
        if (district) fetchWards(district, ward);
      }
    } catch (error) {
      console.error("Error loading saved data:", error);
    }
  };

  const fetchDistricts = (provinceCode, savedDistrict = null) => {
    fetch(`https://provinces.open-api.vn/api/p/${provinceCode}/?depth=2`)
      .then((response) => response.json())
      .then((data) => {
        setDistricts(data.districts || []);
        setWards([]);
        setSelectedDistrict(savedDistrict);
        if (savedDistrict) fetchWards(savedDistrict);
      })
      .catch((error) => console.error("Error fetching districts:", error));
  };

  const fetchWards = (districtCode, savedWard = null) => {
    fetch(`https://provinces.open-api.vn/api/d/${districtCode}/?depth=2`)
      .then((response) => response.json())
      .then((data) => {
        setWards(data.wards || []);
        setSelectedWard(savedWard);
      })
      .catch((error) => console.error("Error fetching wards:", error));
  };

  const validateFields = () => {
    const newErrors = {};

    if (!contactName) newErrors.contactName = "Tên người liên hệ không được để trống.";
    if (!relationship) newErrors.relationship = "Quan hệ không được để trống.";
    if (!phoneNumber) newErrors.phoneNumber = "Số điện thoại không được để trống.";
    if (!selectedProvince) newErrors.province = "Tỉnh/Thành phố không được để trống.";
    if (!selectedDistrict) newErrors.district = "Quận/Huyện không được để trống.";
    if (!selectedWard) newErrors.ward = "Phường/Xã không được để trống.";
    if (!houseNumber) newErrors.houseNumber = "Số nhà/tổ không được để trống.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validateFields()) {
      const selectedProvinceName = provinces.find((province) => province.code === selectedProvince)?.name;
      const selectedDistrictName = districts.find((district) => district.code === selectedDistrict)?.name;
      const selectedWardName = wards.find((ward) => ward.code === selectedWard)?.name;
  
      const emergencyContact = {
        fullName: contactName,
        relationship,
        phoneNumber,
      };
  
      const address = {
        streetNumber: houseNumber,
        ward: selectedWardName,
        district: selectedDistrictName,
        city: selectedProvinceName,
      };
  
      try {
        await AsyncStorage.setItem("emergencyContact", JSON.stringify(emergencyContact));
        await AsyncStorage.setItem("address", JSON.stringify(address));
  
        console.log("Emergency Contact:", emergencyContact);
        console.log("Address:", address);
        navigation.navigate("PersonalInformation");
      } catch (error) {
        console.error("Error saving data:", error);
      }
    }
  };
  

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "android" ? "height" : "padding"}
    >
      <TouchableOpacity style={styles.backButton}>
        <Icon
          onPress={() => navigation.navigate("PersonalInformation")}
          name="arrow-left"
          size={20}
          color="black"
        />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerText}>Thông tin liên hệ khẩn cấp</Text>

        <TextInput
          style={styles.input}
          placeholder="Tên người liên hệ khẩn cấp *"
          placeholderTextColor="#999"
          autoCapitalize="words"
          returnKeyType="next"
          value={contactName}
          onChangeText={setContactName}
        />
        {errors.contactName && <Text style={styles.errorText}>{errors.contactName}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Quan hệ *"
          placeholderTextColor="#999"
          autoCapitalize="words"
          returnKeyType="next"
          value={relationship}
          onChangeText={setRelationship}
        />
        {errors.relationship && <Text style={styles.errorText}>{errors.relationship}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Số điện thoại liên hệ khẩn cấp *"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          returnKeyType="done"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />
        {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}

        <Text style={styles.headerText}>Địa chỉ tạm trú</Text>

        <RNPickerSelect
          placeholder={{ label: "Chọn Tỉnh/Thành phố *", value: null }}
          items={provinces.map((province) => ({
            label: province.name,
            value: province.code,
          }))}
          onValueChange={(value) => {
            setSelectedProvince(value);
            fetchDistricts(value);
          }}
          style={pickerSelectStyles}
          value={selectedProvince}
        />
        {errors.province && <Text style={styles.errorText}>{errors.province}</Text>}

        <RNPickerSelect
          placeholder={{ label: "Chọn Quận/Huyện *", value: null }}
          items={districts.map((district) => ({
            label: district.name,
            value: district.code,
          }))}
          onValueChange={(value) => {
            setSelectedDistrict(value);
            fetchWards(value);
          }}
          style={pickerSelectStyles}
          value={selectedDistrict}
        />
        {errors.district && <Text style={styles.errorText}>{errors.district}</Text>}

        <RNPickerSelect
          placeholder={{ label: "Chọn Phường/Xã *", value: null }}
          items={wards.map((ward) => ({
            label: ward.name,
            value: ward.code,
          }))}
          onValueChange={setSelectedWard}
          style={pickerSelectStyles}
          value={selectedWard}
        />
        {errors.ward && <Text style={styles.errorText}>{errors.ward}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Số nhà/tổ *"
          placeholderTextColor="#999"
          autoCapitalize="words"
          returnKeyType="next"
          value={houseNumber}
          onChangeText={setHouseNumber}
        />
        {errors.houseNumber && <Text style={styles.errorText}>{errors.houseNumber}</Text>}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Lưu</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Styles for the dropdowns
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,  // Rounded corners
    color: 'black',
    marginBottom: 20,
    backgroundColor: 'white',
    elevation: 5, // Đổ bóng dành cho Android
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,  // Rounded corners
    color: 'black',
    marginBottom: 20,
    backgroundColor: 'white',
    elevation: 5, // Đổ bóng dành cho Android
  },
});

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
    marginBottom: 10,
  },
  input: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 20, // Chỉnh sửa khoảng cách dưới trường input
    fontSize: 16,
    color: "#000",
    elevation: 5, // Đổ bóng dành cho Android
  },
  saveButton: {
    backgroundColor: "#270C6D",
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "center",
    marginTop: 5,
    marginBottom: 20,
    marginLeft:260
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
    marginTop: -10,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
  },
});

export default EmergencyContact;

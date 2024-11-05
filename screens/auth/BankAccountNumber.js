import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Modal,
  Image,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BankAccountNumber = ({ route, navigation }) => {
  const [isChecked, setIsChecked] = useState(false);
  const [banks, setBanks] = useState([]);
  const [filteredBanks, setFilteredBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [accountHolder, setAccountHolder] = useState(""); // Tên chủ tài khoản
  const [accountNumber, setAccountNumber] = useState(""); // Số tài khoản
  const [errors, setErrors] = useState({}); // Object to hold error messages
  const [errorMessage, setErrorMessage] = useState("");


  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await axios.get("https://api.httzip.com/api/bank/list");
        const bankData = response.data.data.map(bank => ({
          label: bank.short_name,
          value: bank.code, // Use code for unique identification
          image: bank.logo_url,
          swiftCode: bank.swift_code, // Example usage of additional field
        }));
        setBanks(bankData);
        setFilteredBanks(bankData);
        
        // Call loadBankAccountData here after bank data has been fetched
        loadBankAccountData(bankData);
      } catch (error) {
        console.error("Error fetching bank data:", error);
      }
    };
  
    const loadBankAccountData = async (bankData) => {
      try {
        const storedData = await AsyncStorage.getItem('bankAccount');
        if (storedData) {
          const { accountHolderName, accountNumber, bankName } = JSON.parse(storedData);
          setAccountHolder(accountHolderName || "");
          setAccountNumber(accountNumber || "");
          // Set the selected bank only after bankData is available
          const bank = bankData.find(b => b.label === bankName);
          setSelectedBank(bank || null);
        }
      } catch (error) {
        console.error("Error loading bank account data:", error);
      }
    };
  
    fetchBanks(); // Initiate fetching banks
  }, []); // Empty dependency array to run once on mount

  const toggleCheckbox = () => {
    setIsChecked(!isChecked);
  };

  const handleBankSelect = (bank) => {
    setSelectedBank(bank);
    setModalVisible(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = banks.filter(bank =>
      bank.label.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredBanks(filtered);
  };

  const validate = () => {
    const newErrors = {};
    const accountNumberRegex = /^\d+$/; // Regular expression for only digits

    if (!accountNumber) {
      newErrors.accountNumber = "Số tài khoản không được để trống.";
    } else if (!accountNumberRegex.test(accountNumber)) {
      newErrors.accountNumber = "Số tài khoản phải là số và không chứa chữ và kí tự đặc biệt.";
    }

    if (!selectedBank) {
      newErrors.selectedBank = "Bạn phải chọn ngân hàng.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleSave = async () => {
    // Validate the inputs first
    if (validate()) {
      if (!isChecked) {
        setErrorMessage("Bạn phải cam kết thông tin tài khoản ngân hàng là chính xác.");
      } else {
        // Prepare the data for validation
        const validationData = {
          bank: selectedBank ? selectedBank.value : "",
          account: accountNumber,
        };
  
        try {
          const response = await axios.post(
            "https://api.httzip.com/api/bank/id-lookup-prod",
            validationData,
            {
              headers: {
                "x-api-key": "b7501e2a-eb2d-4632-85b1-9850df1e0d0ckey",
                "x-api-secret": "1d67351f-dd0d-4b0f-a9cc-275454513b18secret",
              },
            }
          );
  
          if (response.data.success) {
            const bankAccountData = {
              accountHolderName: response.data.data.ownerName,
              accountNumber,
              bankName: selectedBank ? selectedBank.label : null,
            };
  
            await AsyncStorage.setItem('bankAccount', JSON.stringify(bankAccountData));
            navigation.navigate("PersonalInformation");
          } else {
            setErrorMessage("Tài khoản ngân hàng không tồn tại.");
          }
        } catch (error) {
          setErrorMessage("Số tài khoản ngân hàng không tồn tại.");
        }
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
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerText}>Tài khoản ngân hàng</Text>
        
        {/* Non-editable TextInput for account holder's name */}
        <TextInput
          style={styles.input}
          placeholder="Tên chủ tài khoản"
          placeholderTextColor="#999"
          value={accountHolder}
          editable={false} // Set editable to false to make it read-only
        />

        <TextInput
          style={styles.input}
          placeholder="Số tài khoản *"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          returnKeyType="done"
          value={accountNumber}
          onChangeText={setAccountNumber}
        />
        {errors.accountNumber && (
          <Text style={styles.errorText}>{errors.accountNumber}</Text>
        )}
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.dropdownContainer}>
          <Text style={styles.selectedBankText}>
            {selectedBank ? selectedBank.label : 'Chọn ngân hàng...'}
          </Text>
          <Icon name="chevron-down" size={20} color="black" />
        </TouchableOpacity>
        {errors.selectedBank && (
          <Text style={styles.errorText}>{errors.selectedBank}</Text>
        )}

        {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Chọn ngân hàng</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm ngân hàng..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={handleSearch}
              />
              <ScrollView style={styles.bankList}>
                {filteredBanks.map((bank) => (
                  <TouchableOpacity
                    key={bank.value}
                    style={styles.bankItem}
                    onPress={() => handleBankSelect(bank)}
                  >
                    <Image source={{ uri: bank.image }} style={styles.bankLogo} />
                    <Text style={styles.bankLabel}>{bank.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View style={styles.checkboxContainer}>
          <TouchableOpacity onPress={toggleCheckbox} style={styles.checkbox}>
            <View style={styles.checkboxBox}>
              {isChecked && (
                <Icon name="check" size={16} color="green" />
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.checkboxLabel}>
            Tôi cam kết cung cấp thông tin tài khoản ngân hàng chính xác
          </Text>
        </View>

        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
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
    padding: 20,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15, // Chỉnh sửa khoảng cách dưới trường input
    fontSize: 16,
    color: "#000",
    borderColor: "#ccc",
    elevation: 5, // Đổ bóng dành cho Android
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
  },
  dropdownContainer: {
    backgroundColor: "white",
    borderColor: "#ccc",
    borderWidth: 1,
    // borderRadius: 5,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedBankText: {
    color: "#000",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    margin: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  searchInput: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  bankList: {
    maxHeight: 300,
  },
  bankItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  bankLogo: {
    width: 70,
    height: 40,
    marginRight: 10,
    resizeMode:'contain'
  },
  bankLabel: {
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: "#270C6D",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  closeButtonText: {
    color: "#fff",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  checkbox: {
    marginRight: 10,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderColor: "#000",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxLabel: {
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
  backButton: {
    marginBottom: 20,
  },
});

export default BankAccountNumber;

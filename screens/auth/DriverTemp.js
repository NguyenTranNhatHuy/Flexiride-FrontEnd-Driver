import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome'; // Thêm thư viện icon

// 2. Temp
const DriverTemp = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    
    const handleContinue = () => {
        // Handle the continue logic here
        console.log('Email entered:', email);
        console.log('Last name entered:', lastName);
        console.log('Phone number entered:', phoneNumber);
        console.log('City selected:', selectedCity);
        // Optionally navigate to the next screen
        // navigation.navigate('NextScreen');
    };

    // State quản lý trạng thái checkbox
    const [isChecked, setIsChecked] = useState(false);

    // Hàm xử lý khi checkbox được bấm
    const toggleCheckbox = () => {
        setIsChecked(!isChecked);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "android" ? "height" : null}
        >
            {/* Nút Back */}
            <TouchableOpacity style={styles.backButton}>
                <Icon name="arrow-left" size={20} color="black" />
            </TouchableOpacity>
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <Text style={styles.headerText}>Đăng ký tài xế mới!</Text>
                    <Text style={styles.subHeaderText}>Vui lòng cho chúng tôi biết về bạn</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            onChangeText={setEmail}
                            value={email}
                            placeholder="Tên *"
                            keyboardType="default"
                            autoCapitalize="words"
                            placeholderTextColor="#6D6A6A"
                        />
                        <TextInput
                            placeholder="Họ *"
                            style={styles.input}
                            onChangeText={setLastName}
                            value={lastName}
                            keyboardType="default"
                            autoCapitalize="words"
                            placeholderTextColor="#6D6A6A"
                        />
                        <TextInput
                            placeholder="Số điện thoại *"
                            style={styles.input}
                            onChangeText={setPhoneNumber}
                            value={phoneNumber}
                            keyboardType="phone-pad"
                            autoCapitalize="none"
                            placeholderTextColor="#6D6A6A"
                        />
                        <Text style={styles.label}>Thành phố *</Text>
                        <Picker
                            selectedValue={selectedCity}
                            style={styles.picker}
                            onValueChange={(itemValue) => setSelectedCity(itemValue)}
                        >
                            <Picker.Item label="Chọn thành phố" value="" />
                            <Picker.Item label="Hà Nội" value="ha_noi" />
                            <Picker.Item label="TP. Hồ Chí Minh" value="ho_chi_minh" />
                        </Picker>
                    </View>

                    {/* Checkbox và Nút tiếp tục */}
                    <View style={styles.checkboxContainer}>
                        <TouchableOpacity onPress={toggleCheckbox} style={styles.checkbox}>
                            {isChecked && (
                                <Icon name="check" size={16} color="green" /> // Hiển thị dấu tick khi được chọn
                            )}
                        </TouchableOpacity>
                        <Text style={styles.checkboxLabel}>
                            Bằng cách tiếp tục, tôi đồng ý FRide có thể thu thập, sử dụng và tiết lộ thông tin do tôi cung cấp theo thông báo về quyền riêng tư.
                            Tôi cũng xác nhận đã đọc hiểu rõ và hoàn toàn tuân thủ các điều khoản và điều kiện.
                        </Text>
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleContinue}>
                        <Text style={styles.buttonText}>Tiếp tục</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFC323',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        paddingTop: 30,
    },
    scrollContainer: {
        flexGrow: 1,
    },
    inputContainer: {
        width: '100%',
    },
    content: {
        width: '100%',
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingHorizontal: 20,
        marginBottom: 300,
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#000',
        textAlign: 'left',
    },
    subHeaderText: {
        fontSize: 16,
        textAlign: 'left',
        paddingHorizontal: 0,
        fontWeight: '300',
        marginBottom: 10,
    },
    label: {
        marginTop: 20,
        marginBottom: 10,
        fontWeight: 'bold',
    },
    input: {
        height: 50,
        marginHorizontal: 0,
        borderWidth: 1,
        padding: 10,
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 8,
        borderColor: '#6C6A6A',
        margin: 20,
    },
    picker: {
        height: 50,
        width: '100%',
        backgroundColor: '#fff',
        borderColor: '#6C6A6A',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 20,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start', // Căn chỉnh cho checkbox
        marginTop: 20,
        width: '100%', // Đảm bảo checkboxContainer có chiều rộng đầy đủ
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: '#6C6A6A',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    checked: {
        width: 14,
        height: 14,
        backgroundColor: '#270C6D',
    },
    checkboxLabel: {
        fontSize: 14,
        color: '#000',
        flexShrink: 1, // Giúp văn bản không bị tràn ra ngoài
        maxWidth: '85%', // Giới hạn chiều rộng của văn bản
    },
    button: {
        backgroundColor: '#270C6D',
        paddingHorizontal: 40,
        paddingVertical: 10,
        borderRadius: 20,
        alignSelf: 'flex-end',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 10,
        padding:10,
        marginTop: 10           
    },
});

export default DriverTemp;

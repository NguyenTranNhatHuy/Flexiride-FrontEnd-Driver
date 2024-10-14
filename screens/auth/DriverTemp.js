import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';

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

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "android" ? "height" : null}
        >
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
        fontWeight: '100',
        marginBottom: 30,
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
        margin: 20
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
    button: {
        backgroundColor: '#270C6D',
        paddingHorizontal: 40,
        paddingVertical: 10,
        borderRadius: 20,
        marginTop: 50,
        alignSelf: 'flex-end',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default DriverTemp;

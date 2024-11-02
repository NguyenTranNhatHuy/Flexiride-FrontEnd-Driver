import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { generateOtpCode } from '../../common/GenerateOtpCode';
import sendEmail from "../../utils/SentEmail";

const InsertCode = ({ navigation, route }) => {
    const [code, setCode] = useState(['', '', '', '', '']);  // Array for each input field
    const [timer, setTimer] = useState(30);
    const [email, setEmail] = useState('');  // State to store email from local storage
    const [dummyCode, setDummyCode] = useState(route.params.otpCode); // Dummy verification code
    const [name] = useState(route.params.name); // Dummy verification code

    const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

    useEffect(() => {
        // Fetch email from local storage on component mount
        const fetchEmail = async () => {
            try {
                const storedPersonalInfo = await AsyncStorage.getItem('personalInfo');
                if (storedPersonalInfo) {
                    const parsedInfo = JSON.parse(storedPersonalInfo);
                    setEmail(parsedInfo.email);  // Set the email in state
                }
            } catch (error) {
                console.log('Error fetching email:', error);
            }
        };

        fetchEmail();

        const countdown = setInterval(() => {
            setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
        }, 1000);

        return () => clearInterval(countdown);
    }, []);

    const handleChange = (text, index) => {
        const newCode = [...code];

        if (/^\d$/.test(text)) {
            newCode[index] = text;
            setCode(newCode);
            if (index < 4) {
                inputRefs[index + 1].current.focus();
            }
        } else if (text === '') {
            newCode[index] = '';
            setCode(newCode);
            if (index > 0) {
                inputRefs[index - 1].current.focus();
            }
        }
    };

    const handleKeyPress = (key, index) => {
        if (key === 'Backspace' && code[index] === '') {
            if (index > 0) {
                inputRefs[index - 1].current.focus();
            }
        }
    };

    const handleVerifyCode = () => {
        const enteredCode = code.join('');
        if (enteredCode === dummyCode) {
            navigation.navigate('SubscriptionService');
        } else {
            Alert.alert('Thông báo', 'Mã xác thực không đúng. Vui lòng thử lại.');
        }
    };

    const handleResendCode = () => {
        setTimer(30);
        setCode(['', '', '', '', '']);
        Alert.alert('Thông báo', 'Mã xác thực mới đã được gửi!');
        const newOtpCode = generateOtpCode();
        sendEmail(name, email, newOtpCode);
        setDummyCode(newOtpCode);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "android" ? "height" : null}
        >
            <TouchableOpacity style={styles.backButton}>
                <Icon onPress={() => navigation.navigate('DriverTemp')} name="arrow-left" size={20} color="black" />
            </TouchableOpacity>
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.container1}>
                    <Text style={styles.title}>Kiểm tra tin nhắn được gửi đến email của bạn:</Text>
                    <Text style={styles.description}>
                        Chúng tôi đã gửi một mã OTP đến email: 
                    </Text>
                    <Text style={styles.phone}>{email}</Text>
                    <View style={styles.codeInputContainer}>
                        {code.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={inputRefs[index]}
                                style={styles.codeInput}
                                keyboardType="numeric"
                                maxLength={1}
                                onChangeText={(text) => handleChange(text, index)}
                                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                                value={digit}
                            />
                        ))}
                    </View>

                    <View style={styles.resendContainer}>
                        <Text>Bạn đã nhận được mã chưa ?</Text>
                        <TouchableOpacity style={styles.resendButton} onPress={handleResendCode} disabled={timer > 0}>
                            <Text style={styles.resendText}>Nhận mã mới {timer > 0 && (
                                <Text style={styles.timerText}>sau 00:{timer < 10 ? `0${timer}` : timer}</Text>
                            )}</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleVerifyCode}>
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
    container1: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFC323',
    },
    title: {
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#000',
        marginTop: 20,
    },
    description: {
        fontSize: 16,
        color: '#333',
    },
    phone: {
        fontSize: 16,
        color: '#333',
        marginBottom: 60,
    },
    codeInputContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    codeInput: {
        backgroundColor: '#FFF8E1',
        fontSize: 24,
        padding: 10,
        borderRadius: 8,
        width: 50,
        height: 50,
        textAlign: 'center',
        borderWidth: 1,
        borderColor: '#C4C4C4',
        marginHorizontal: 5,
    },
    resendContainer: {
        marginTop: 130,
        marginRight: 150
    },
    resendButton: {
        marginRight: 10,
    },
    resendText: {
        color: '#1E90FF',
        fontSize: 16,
    },
    timerText: {
        color: '#333',
        fontSize: 16,
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
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        zIndex: 10,
        width: 50,
    },  
});

export default InsertCode;

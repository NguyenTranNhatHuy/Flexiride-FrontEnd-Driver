import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Thêm thư viện icon



//3. Inset code
const InsertCode = () => {
    const [code, setCode] = useState(['', '', '', '']);  // Mỗi phần tử trong mảng là một ô
    const [timer, setTimer] = useState(30);

    // Tạo tham chiếu cho mỗi TextInput
    const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

    React.useEffect(() => {
        const countdown = setInterval(() => {
            setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
        }, 1000);

        return () => clearInterval(countdown);
    }, []);

    const handleChange = (text, index) => {
        const newCode = [...code];
        
        // Chỉ chấp nhận số và phải chỉ có 1 ký tự
        if (/^\d$/.test(text)) { // Kiểm tra xem ký tự nhập vào có phải là số không
            newCode[index] = text;
            setCode(newCode);

            // Tự động chuyển sang ô tiếp theo nếu ô hiện tại có ký tự
            if (index < 3) {
                inputRefs[index + 1].current.focus();
            }
        } else if (text === '') {
            // Nếu xóa (ô trống), giữ nguyên và quay lại ô trước đó nếu có
            newCode[index] = '';
            setCode(newCode);
            if (index > 0) {
                inputRefs[index - 1].current.focus();
            }
        }
    };

    const handleKeyPress = (key, index) => {
        if (key === 'Backspace' && code[index] === '') {
            // Di chuyển về ô trước nếu nhấn Backspace và ô hiện tại đang trống
            if (index > 0) {
                inputRefs[index - 1].current.focus();
            }
        }
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
        <View style={styles.container1}>
            <Text style={styles.title}>Kiểm tra tin nhắn SMS của bạn:</Text>
            <Text style={styles.description}>
                Chúng tôi đã gửi một mã có 4 chữ số đến số điện thoại: 
            </Text>
            <Text style={styles.phone}>+84 935536***</Text>
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

            {/* Chỉnh phần Nhận mã mới và bộ đếm */}
            <View style={styles.resendContainer}>
                <Text>Bạn đã nhận được mã chưa ?</Text>
                <TouchableOpacity style={styles.resendButton} disabled={timer > 0}>
                    <Text style={styles.resendText}>Nhận mã mới {timer > 0 && (
                    <Text style={styles.timerText}>sau 00:{timer < 10 ? `0${timer}` : timer}</Text>
                )}</Text>
                </TouchableOpacity>
                
            </View>

            <TouchableOpacity style={styles.button} >
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
        marginBottom: 10,
        color: '#000',
        marginTop: 20,
    },
    description: {
        fontSize: 16,
        color: '#333',
        textAlign: 'justify',
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
        marginRight:150
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
    },
});

export default InsertCode;

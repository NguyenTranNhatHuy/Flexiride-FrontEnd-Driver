import React from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Image, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
export default function Login() {

    const navigation = useNavigation();
    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "android" ? "height" : null}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.logoContainer}>
                    <Image source={require("../../assets/FRide.png")} style={styles.logo} />
                    <Image source={require("../../assets/Driver.png")} style={styles.logo} />
                </View>
                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder="Số điện thoại"
                        style={styles.input}
                        keyboardType="phone-pad"
                        autoCapitalize="none"
                        placeholderTextColor="#6D6A6A"
                    />
                    <TextInput
                        placeholder="Mật khẩu"
                        style={styles.input}
                        secureTextEntry={true}
                        placeholderTextColor="#6D6A6A"
                    />
                    <View style={styles.forgotPasswordContainer}>
                        <TouchableOpacity>
                            <Text style={styles.forgotPassword}>Quên mật khẩu</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>ĐĂNG NHẬP</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=> navigation.navigate('DriverSignUpScreen')}>
                    <Text style={styles.signUpText}>Chưa có tài khoản? Đăng ký</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFC323',
    },
    scrollContainer: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 10,
        width: 200,
        height: 200,
    },
    logo: {
        resizeMode: 'contain',
    },
    inputContainer: {
        width: '80%',
    },
    input: {
        height: 40,
        borderColor: '#6C6A6A',
        borderWidth: 1,
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
    },
    forgotPasswordContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 20,
    },
    forgotPassword: {
        color: 'black',
    },
    button: {
        width: '80%',
        height: 40,
        backgroundColor: '#270C6D',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginBottom: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    signUpText: {
        color: 'black',
        fontSize: 16,
    },
});

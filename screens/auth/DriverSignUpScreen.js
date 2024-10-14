import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';



//1. splash đăng kí
const DriverSignUpScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');

    const handleContinue = () => {
        // Handle the continue logic here
        console.log('Email entered:', email);
        // Optionally navigate to the next screen
        // navigation.navigate('NextScreen');
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "android" ? "height" : null}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

                <View style={styles.container}>
                    <View style={styles.content}>
                        <Text style={styles.headerText}>Trở thành đối tác của FRide</Text>
                        <Text style={styles.subHeaderText}>Mang lại niềm vui </Text>
                        <Text style={styles.subHeaderText}>sự thuận tiện cho khách hàng!</Text>
                        <View style={styles.googleSignUpContainer}>
                            <View style={styles.line} />
                            <Text style={styles.googleText}>Đăng ký tài khoản Google</Text>
                            <View style={styles.line} />
                        </View>
                        <TextInput
                            style={styles.input}
                            onChangeText={setEmail}
                            value={email}
                            placeholder="Tài khoản Google"
                            keyboardType="email-address"
                            placeholderTextColor="#6D6A6A"
                        />
                        <TouchableOpacity style={styles.button} onPress={handleContinue}>
                            <Text style={styles.buttonText}>Tiếp tục</Text>
                        </TouchableOpacity>
                    </View>
                    <Image style={styles.image} source={require('../../assets/splash.png')} />
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

    content: {
        width: '100%',
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingHorizontal: 20,
        marginBottom: 300
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#000',
        textAlign: 'left',
    },
    subHeaderText: {
        fontSize: 24,
        textAlign: 'left',
        paddingHorizontal: 0,
        fontWeight: 'bold'
    },
    googleSignUpContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 50
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: 'black',
    },
    googleText: {
        fontSize: 16,
        paddingHorizontal: 10,
    },
    input: {
        height: 50,
        marginHorizontal: 0,
        borderWidth: 1,
        padding: 10,
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 8,
        marginTop: 20,
        borderColor: '#6C6A6A',
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
    image: {
        width: '100%',
        position: 'absolute',
        bottom: 0,
        resizeMode: 'cover',
    },
});

export default DriverSignUpScreen;

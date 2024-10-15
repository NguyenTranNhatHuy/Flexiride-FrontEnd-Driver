import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Thêm thư viện icon


//11. TT liên hệ khẩn cấp & cư trú
const EmergencyContact = () => {
    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "android" ? "height" : "padding"}
        >
            {/* Nút Back */}
            <TouchableOpacity style={styles.backButton}>
                <Icon name="arrow-left" size={20} color="black" />
            </TouchableOpacity>
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                
                {/* Header */}
                <Text style={styles.headerText}>Thông tin liên hệ khẩn cấp</Text>

                {/* Emergency Contact Inputs */}
                <TextInput 
                    style={styles.input} 
                    placeholder="Tên người liên hệ khẩn cấp *" 
                    placeholderTextColor="#999"
                    autoCapitalize="words"
                    returnKeyType="next"
                />
                <TextInput 
                    style={styles.input} 
                    placeholder="Quan hệ *" 
                    placeholderTextColor="#999"
                    autoCapitalize="words"
                    returnKeyType="next"
                />
                <TextInput 
                    style={styles.input} 
                    placeholder="Số điện thoại liên hệ khẩn cấp *" 
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                    returnKeyType="done"
                />

                {/* Address Section */}
                <Text style={styles.headerText}>Địa chỉ tạm trú</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="Số nhà/tổ *" 
                    placeholderTextColor="#999"
                    autoCapitalize="words"
                    returnKeyType="next"
                />
                <TextInput 
                    style={styles.input} 
                    placeholder="Xã/Phường *" 
                    placeholderTextColor="#999"
                    autoCapitalize="words"
                    returnKeyType="next"
                />
                <TextInput 
                    style={styles.input} 
                    placeholder="Quận/Huyện *" 
                    placeholderTextColor="#999"
                    autoCapitalize="words"
                    returnKeyType="next"
                />
                <TextInput 
                    style={styles.input} 
                    placeholder="Tỉnh/Thành phố *" 
                    placeholderTextColor="#999"
                    autoCapitalize="words"
                    returnKeyType="done"
                />

                {/* Save Button */}
                <TouchableOpacity style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Lưu</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

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
        paddingHorizontal: 20,
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'justify',
        marginBottom: 10,
    },
    input: {
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        marginBottom: 20,
        fontSize: 16,
        color: '#000',
        borderWidth: 1,              // Độ rộng của viền
        borderColor: 'black',        // Màu viền
        elevation: 5,                // Đổ bóng dành cho Android
    },
    saveButton: {
        backgroundColor: '#270C6D',
        paddingHorizontal: 40,
        paddingVertical: 10,
        borderRadius: 20,
        alignSelf: 'center',
        marginLeft:260,
        marginTop: 5,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 10,
        padding:10,        
        marginTop:10           
    },
});

export default EmergencyContact;

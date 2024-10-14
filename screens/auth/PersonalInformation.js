import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';

//6. Thông tin cá nhân
const PersonalInformation = () => {
    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "android" ? "height" : null}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <Text style={styles.headerText}>Thông tin cá nhân</Text>

                {/* Các mục thông tin cá nhân */}
                <View style={styles.itemContainer}>
                    <Text style={styles.itemText}>1/ Ảnh Chân Dung</Text>
                    <TouchableOpacity style={styles.requiredButton}>
                        <Text style={styles.requiredButtonText}>Bắt buộc</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.itemContainer}>
                    <Text style={styles.itemText}>2/ CCCD/Hộ Chiếu</Text>
                    <TouchableOpacity style={styles.requiredButton}>
                        <Text style={styles.requiredButtonText}>Bắt buộc</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.itemContainer}>
                    <Text style={styles.itemText}>3/ Bằng Lái Xe</Text>
                    <TouchableOpacity style={styles.requiredButton}>
                        <Text style={styles.requiredButtonText}>Bắt buộc</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.itemContainer}>
                    <Text style={styles.itemText}>4/ Hồ Sơ Lý Lịch Tư Pháp</Text>
                    <TouchableOpacity style={styles.requiredButton}>
                        <Text style={styles.requiredButtonText}>Bắt buộc</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.itemContainer}>
                    <Text style={styles.itemText}>5/ Thông Tin Liên Hệ Khẩn Cấp Và Địa Chỉ Tạm Trú</Text>
                    <TouchableOpacity style={styles.requiredButton}>
                        <Text style={styles.requiredButtonText}>Bắt buộc</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.itemContainer}>
                    <Text style={styles.itemText}>6/ Tài Khoản Ngân Hàng</Text>
                    <TouchableOpacity style={styles.requiredButton}>
                        <Text style={styles.requiredButtonText}>Bắt buộc</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.itemContainer}>
                    <Text style={styles.itemText}>7/ Cam Kết</Text>
                    <TouchableOpacity style={styles.requiredButton}>
                        <Text style={styles.requiredButtonText}>Bắt buộc</Text>
                    </TouchableOpacity>
                </View>

                {/* Nút tiếp tục */}
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Tiếp tục</Text>
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
        paddingHorizontal: 20,
    },
    scrollContainer: {
        flexGrow: 1,
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 20,
        marginTop:40
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        padding:5,
        borderBottomWidth: 1,  // Border bottom
        borderBottomColor: '#000',  // Màu của border bottom
    },
    itemText: {
        fontSize: 16,
        color: '#000',
        flex: 1,
        fontWeight:'bold'
    },
    requiredButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    requiredButtonText: {
        color: '#008E3F',  
        fontSize: 14,
    },
    button: {
        backgroundColor: '#270C6D',
        paddingHorizontal: 40,
        paddingVertical: 10,
        borderRadius: 20,
        marginTop: 30,
        alignSelf: 'flex-end',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
})

export default PersonalInformation;

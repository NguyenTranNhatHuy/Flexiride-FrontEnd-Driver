import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Thêm thư viện icon


//14. thong tin xe
const VehicleInformation = () => {
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
                <Text style={styles.headerText}>Thông tin phương tiện</Text>

                {/* Các mục thông tin cá nhân */}
                {['Hình Xe', 'Giấy Đăng ký xe', 'Bảo hiểm xe'].map((item, index) => (
                    <View key={index} style={styles.itemContainer}>
                        <Text style={styles.itemText}>{index + 1}/ {item}</Text>
                        <TouchableOpacity style={styles.requiredButton}>
                            <Text style={styles.requiredButtonText}>Bắt buộc</Text>
                            {/* Thêm biểu tượng ">" vào đây */}
                            <Icon name="chevron-right" size={14} color="#000" style={styles.icon} />
                        </TouchableOpacity>
                    </View>
                ))}

                {/* Nút tiếp tục */}
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Gửi Hồ Sơ</Text>
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
        marginTop: 20
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        padding: 5,
        borderBottomWidth: 1,  // Border bottom
        borderBottomColor: '#000',  // Màu của border bottom
    },
    itemText: {
        fontSize: 16,
        color: '#000',
        flex: 1,
        fontWeight: 'bold'
    },
    requiredButton: {
        flexDirection: 'row', // Sử dụng flexDirection để sắp xếp icon và text
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    requiredButtonText: {
        color: '#008E3F',
        fontSize: 14,
        marginRight: 5, // Khoảng cách giữa văn bản và biểu tượng
    },
    icon: {
        marginLeft: 5, // Khoảng cách bên trái biểu tượng
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
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 10,
        marginTop: 10           
    },
})

export default VehicleInformation;

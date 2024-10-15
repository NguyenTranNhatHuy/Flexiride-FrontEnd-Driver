import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Thêm thư viện icon


//7. Ảnh chân dung
const PortraitPhoto = () => {
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
                
                {/* Header */}
                <Text style={styles.headerText}>Tải ảnh chân dung lên</Text>

                {/* Upload Button */}
                <TouchableOpacity style={styles.uploadButton}>
                    <Image 
                        source={require('../../assets/camera.png')} 
                        style={styles.icon} 
                    />
                    <Text style={styles.uploadText}>Tải ảnh lên</Text>
                </TouchableOpacity>

                {/* Requirements */}
                <View style={styles.requirementsContainer}>
                    <Text style={styles.requirementsHeader}>Yêu Cầu:</Text>
                    <Text style={styles.requirementsText}>• Ảnh chụp với phông nền trơn</Text>
                    <Text style={styles.requirementsText}>• Ảnh chụp từ phần thân trên, rõ nét, không chói loá</Text>
                    <Text style={styles.requirementsText}>• Ảnh chụp chính diện nhìn thẳng, không nhắm mắt</Text>
                    <Text style={styles.requirementsText}>• Không sử dụng ảnh thẻ hoặc hình selfie</Text>
                    <Text style={styles.requirementsText}>• Ảnh chụp không đội mũ, không đeo kính râm</Text>
                    <Text style={styles.requirementsText}>• Ảnh chụp không được có thêm người, động vật hoặc các vật khác trong khung hình</Text>
                </View>

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
        textAlign: 'center',
        marginBottom: 30,
        marginTop:20
    },
    uploadButton: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
    
    },
    icon: {
        width: 100, 
        height: 100, 
        marginBottom: 10,
        borderRadius: 50, 
        backgroundColor: '#D9D9D9',
        borderWidth: 4,  
        borderColor: '#000000',  
        resizeMode: 'cover',
    },
    uploadText: {
        color: '#6A6A6A',
        fontSize: 16,
    },
    requirementsContainer: {
        backgroundColor: '#D9D9D9',
        padding: 20,
        borderRadius: 10,
    },
    requirementsHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    requirementsText: {
        fontSize: 14,
        marginBottom: 5,
    },
    saveButton: {
        backgroundColor: '#270C6D',
        paddingHorizontal: 40,
        paddingVertical: 10,
        borderRadius: 20,
        marginTop: 70,
        alignSelf: 'center',
        marginLeft:260
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

export default PortraitPhoto;

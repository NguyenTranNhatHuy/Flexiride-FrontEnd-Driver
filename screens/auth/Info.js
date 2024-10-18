import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Thêm thư viện icon


//5. Thông tin
const Info = ({navigation, route}) => {
    const handleContinue = () => {
        navigation.navigate('PersonalInformation', {
            email: route.params.email,
            password: route.params.password,
            firstName:route.params.firstName,
            lastName: route.params.lastName,
            phoneNumber: route.params.phoneNumber,
            city: route.params.selectedCity,
            serviceType: route.params.serviceType
        });
    };
    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "android" ? "height" : null}
        >
            {/* Nút Back */}
            {/* <TouchableOpacity style={styles.backButton}>
                <Icon name="arrow-left" size={20} color="black" />
            </TouchableOpacity> */}
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

                <Text style={styles.register}>Trước khi tiến hành đăng ký...</Text>
                
                {/* Câu hỏi 1 */}
                <View style={styles.questionContainer}>
                    <Text style={styles.questionTitle}>
                        1/ Đây là ứng dụng dành cho tài xế đăng ký hoạt động với FRide. Bạn muốn đăng ký trở thành tài xế?
                    </Text>
                    <Text style={styles.infoText}>
                        Nếu đối tác đã từng hoạt động với FRide, cần sử dụng đúng Email đã đăng ký tài khoản!
                    </Text>
                </View>

                {/* Câu hỏi 2 */}
                <View style={styles.questionContainer}>
                    <Text style={styles.questionTitle}>
                        2/ Bạn có đáp ứng được các yêu cầu sau đây không?
                    </Text>
                    <Text style={styles.infoText}>
                        • Công dân Việt Nam trong độ tuổi: Nam từ 18 đến 60 tuổi, Nữ từ 18 đến 55 tuổi{'\n'}
                        • Có khả năng đọc viết
                    </Text>
                </View>

                {/* Câu hỏi 3 */}
                <View style={styles.questionContainer}>
                    <Text style={styles.questionTitle}>
                        3/ Bạn đã có lý lịch tư pháp chưa?
                    </Text>
                    <Text style={styles.infoText}>
                        • Lý lịch tư pháp còn hạn ít nhất 10 tháng kể từ ngày cấp{'\n'}
                        • Bạn có thể đăng ký bằng giấy hẹn LLTP hoặc biên lai bưu điện
                    </Text>
                </View>

                {/* Các nút chọn */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={() => navigation.navigate('SubscriptionService', { email: route.params.email  })} style={[styles.optionButton, styles.optionLeft]}>
                        <Text style={styles.optionLeftText}>Không</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleContinue} style={[styles.optionButton, styles.optionRight]}>
                        <Text style={styles.optionButtonText}>Có, tiếp tục</Text>
                    </TouchableOpacity>
                </View>

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

    register: {
        fontStyle: 'italic',
        marginTop: 20,
    },
    questionContainer: {
        marginBottom: 20,
    },
    questionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 10,
    },
    infoText: {
        fontSize: 16,
        color: '#555',
        backgroundColor: '#D9D9D9',
        padding: 10,
        borderRadius: 10,
    },
    buttonContainer: {
        flexDirection: 'row',  
        justifyContent: 'space-between',  
        marginTop: 30,
    },
    optionButton: {
        paddingHorizontal: 40,
        paddingVertical: 10,
        borderRadius: 20,
        marginVertical: 10,
        flex: 1,  
    },
    optionLeft: {
        backgroundColor: '#BEBEBE',
        marginRight: 10,  
    },
    optionRight: {
        backgroundColor: '#270C6D',
        marginLeft: 10,  
    },
    optionButtonText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
    },
    optionLeftText: {
        color: 'black',  
        fontSize: 16,
        textAlign: 'center',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 10,    
        marginTop:10               
    },
})

export default Info;

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const ProfileApproval = () => {
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
                <Text style={styles.headerText}>
                    Chúng tôi đã nhận được đơn đăng ký của bạn!
                </Text>

                {/* Bước kiểm tra trạng thái */}
                <View style={styles.stepContainer}>
                    <View style={styles.stepItem}>
                        <Icon name="check-circle" size={20} color="green" />
                        <Text style={styles.stepText}>   Nộp hồ sơ đăng ký</Text>
                    </View>
                    <View style={styles.stepItem}>
                        <View style={styles.circle} />
                        <Text style={styles.stepText}>Hồ sơ đang được xét duyệt</Text>
                    </View>
                    <View style={styles.stepItem}>
                        <View style={styles.circle} />
                        <Text style={styles.stepText}>...</Text>
                    </View>
                    <View style={styles.stepItem}>
                        <View style={styles.circle} />
                        <Text style={styles.stepText}>Kích hoạt tài khoản</Text>
                    </View>
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
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 20,
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'justify',
        marginBottom: 30,
        marginTop: 20,
    },
    stepContainer: {
        marginBottom: 30,
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    stepText: {
        fontSize: 16,
        marginLeft: 10,
        fontWeight:'bold'
    },
    circle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#6C6A6A',
        marginRight: 10,
        backgroundColor: '#FFF', // Background for uncompleted steps
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 10,
        padding: 10,
        marginTop: 10,
    },
});

export default ProfileApproval;

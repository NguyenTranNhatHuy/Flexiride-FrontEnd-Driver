import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import Login from "./screens/auth/Login";
import PartnerSignUpScreen from "./screens/auth/DriverSignUpScreen";
import DriverTemp from "./screens/auth/DriverTemp";
import InsertCode from "./screens/auth/InsertCode";
import SubscriptionService from "./screens/auth/SubscriptionService";
import Info from "./screens/auth/Info";
import PersonalInformation from "./screens/auth/PersonalInformation";
import PortraitPhoto from "./screens/auth/PortraitPhoto";
import Passport from "./screens/auth/Passport";
import License from "./screens/auth/License";
import JudicialBackground from "./screens/auth/JudicialBackground";
import EmergencyContact from "./screens/auth/EmergencyContact";
import BankAccountNumber from "./screens/auth/BankAccountNumber";
import Commitment from "./screens/auth/Commitment";
import VehicleInformation from "./screens/auth/VehicleInformation";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Splash from "./screens/Splash";
import DriverSignUpScreen from "./screens/auth/DriverSignUpScreen";
import CarImage from "./screens/auth/CarImage";
import VehicleRegistration from "./screens/auth/VehicleRegistration";
import CarInsurance from "./screens/auth/CarInsurance";
import ProfileApproval from "./screens/auth/ProfileApproval";
import { AuthProvider } from "./provider/AuthProvider";
import HomeScreen from "./screens/HomeScreen";
import { SocketProvider } from "./provider/SocketProvider";
import { LocationProvider } from "./provider/LocationCurrentProvider";
import ForgotPassworDriver from "./screens/forgot-pass/ForgotPasswordDriver";
import EnterOtp from "./screens/forgot-pass/EnterOtp";
import EnterNewPass from "./screens/forgot-pass/EnterNewPass";
import ChangePassSuccess from "./screens/forgot-pass/ChangePassSuccess";
import ForgotPasswordDriver from "./screens/forgot-pass/ForgotPasswordDriver";
import BookingTraditional from "./screens/booking-traditional/BookingTraditional";
import ChatScreenDriver from "./screens/booking-traditional/ChatScreen";
import DriverProfile from "./screens/profile/DriverProfile";
import { enableScreens } from "react-native-screens";
import SimpleMap from "./screens/ShowMap";
import Vietmap from "@vietmap/vietmap-gl-react-native";
import VietMapNavigationScreen from "./screens/booking-traditional/navigation/VietMapNavigation";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import DriverScreen from "./screens/booking-traditional/DriverScreen";
import EmergencyContactsScreen from "./screens/booking-traditional/EmergencyContact";
import PaymentScreen from "./screens/booking-traditional/PaymentScreen";
import Earnings from "./screens/booking-traditional/Earnings";
import EarningsDetailScreen from "./screens/booking-traditional/EarningDetails";
import EarningsHistoryScreen from "./screens/booking-traditional/EarningsHistoryScreen";
import ServiceScreen from "./screens/ServiceScreen";
import WalletScreen from "./screens/WalletScreen";

export default function App() {
  enableScreens();
  Vietmap.setApiKey(null);

  const Stack = createNativeStackNavigator();
  return (
    // <SocketProvider>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LocationProvider>
        <AuthProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Splash">
              <Stack.Screen
                name="Splash"
                component={Splash}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Login"
                component={Login}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="DriverSignUpScreen"
                component={DriverSignUpScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="DriverTemp"
                component={DriverTemp}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="InsertCode"
                component={InsertCode}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="SubscriptionService"
                component={SubscriptionService}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Info"
                component={Info}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="PersonalInformation"
                component={PersonalInformation}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="PortraitPhoto"
                component={PortraitPhoto}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Passport"
                component={Passport}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="License"
                component={License}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="JudicialBackground"
                component={JudicialBackground}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="EmergencyContact"
                component={EmergencyContact}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="BankAccountNumber"
                component={BankAccountNumber}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Commitment"
                component={Commitment}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="VehicleInformation"
                component={VehicleInformation}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="CarImage"
                component={CarImage}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="VehicleRegistration"
                component={VehicleRegistration}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="CarInsurance"
                component={CarInsurance}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ProfileApproval"
                component={ProfileApproval}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="HomeScreen"
                component={HomeScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="DriverScreen"
                component={DriverScreen}
                options={{ headerShown: false }}
              />
              {/* start Forgot-pass */}
              <Stack.Screen
                name="ForgotPasswordDriver"
                component={ForgotPasswordDriver}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="EnterOtp"
                component={EnterOtp}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="EnterNewPass"
                component={EnterNewPass}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ChangePassSuccess"
                component={ChangePassSuccess}
                options={{ headerShown: false }}
              />
              {/* end forgot pass */}
              {/* Start Profile */}
              <Stack.Screen
                name="DriverProfile"
                component={DriverProfile}
                options={{ headerShown: false }}
              />
              {/* end profile */}
              <Stack.Screen
                name="BookingTraditional"
                component={BookingTraditional}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="VietMapNavigationScreen"
                component={VietMapNavigationScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ChatScreenDriver"
                component={ChatScreenDriver}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="SimpleMap"
                component={SimpleMap}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="EmergencyContactSupport"
                component={EmergencyContactsScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="PaymentScreen"
                component={PaymentScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Earnings"
                component={Earnings}
                options={{ title: "Thu nhập" }}
              />
              <Stack.Screen
                name="EarningsDetailScreen"
                component={EarningsDetailScreen}
                options={{ title: "Chi tiết thu nhập" }}
              />
              <Stack.Screen
                name="EarningsHistoryScreen"
                component={EarningsHistoryScreen}
                options={{ title: "Lịch sử thu nhập" }}
              />
              <Stack.Screen
                name="ServiceScreen"
                component={ServiceScreen}
                options={{ title: "Chọn dịch vụ" }}
              />
              <Stack.Screen
                name="WalletScreen"
                component={WalletScreen}
                options={{ title: "Ví cá nhân" }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </AuthProvider>
      </LocationProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

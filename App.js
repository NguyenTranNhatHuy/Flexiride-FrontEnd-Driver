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
import DriverScreen from "./screens/DriverScreen";
import { SocketProvider } from "./provider/SocketProvider";
import { LocationProvider } from "./provider/LocationCurrentProvider";
import BookingTraditional from "./screens/BookingTraditional";
import VietMapNavigationScreen from "./screens/VietMapNavigationScreen";
import ChatScreenDriver from "./screens/ChatScreen";
export default function App() {
  const Stack = createNativeStackNavigator();
  return (
    // <Login />
    // <PartnerSignUpScreen />
    // <DriverTemp />
    // <InsertCode/>
    // <SubscriptionService/>
    // <Info/>
    // <PersonalInformation/>
    // <PortraitPhoto/>
    // <Passport/>
    // <License/>
    // <JudicialBackground/>
    // <EmergencyContact/>
    // <BankAccountNumber/>
    // <Commitment/>
    // <VehicleInformation/>
    // <CarImage/>
    // <VehicleRegistration/>
    // <CarInsurance/>
    // <ProfileApproval/>
    // <Splash/>
    // <SocketProvider>
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
              name="Login"
              component={Login}
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
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </LocationProvider>
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

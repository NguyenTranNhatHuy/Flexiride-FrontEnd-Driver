import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Login from './screens/auth/Login';
import PartnerSignUpScreen from './screens/auth/DriverSignUpScreen';
import DriverTemp from './screens/auth/DriverTemp';
import InsertCode from './screens/auth/InsertCode';
import SubscriptionService from './screens/auth/SubscriptionService';
import Info from './screens/auth/Info';
import PersonalInformation from './screens/auth/PersonalInformation';
import PortraitPhoto from './screens/auth/PortraitPhoto';
import Passport from './screens/auth/Passport';
import License from './screens/auth/License';

export default function App() {
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
    <License/>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

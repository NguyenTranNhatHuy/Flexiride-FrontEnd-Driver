import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Login from './screens/auth/Login';
import PartnerSignUpScreen from './screens/auth/DriverSignUpScreen';
import DriverTemp from './screens/auth/DriverTemp';

export default function App() {
  return (
    // <Login />
    // <PartnerSignUpScreen />
    <DriverTemp />
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

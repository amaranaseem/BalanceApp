import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/LoginScreen';
import SplashScreen from './screens/SplashScreen';
import BoardingScreen from './screens/BoardingScreen';
import BottomNavTab from './BottomNavTab';
import MoodcheckInScreen from './screens/MoodcheckInScreen';



const Stack = createNativeStackNavigator();


export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{headerShown: false}}>
      <Stack.Screen name="HomeTabs" component={BottomNavTab}/>  
      <Stack.Screen name="Register" component={RegisterScreen}/>
      <Stack.Screen name="Login" component={LoginScreen}/>
      <Stack.Screen name="Splash" component={SplashScreen}/>
      <Stack.Screen name="Board" component={BoardingScreen}/>
      <Stack.Screen name="MoodCheckIn" component={MoodcheckInScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/LoginScreen';
import SplashScreen from './screens/SplashScreen';
import BoardingScreen from './screens/BoardingScreen';
import BottomNavTab from './BottomNavTab';
import MoodCheckInScreen from './screens/MoodcheckInScreen';
import NotepadScreen from './screens/NotepadScreen';
import HabitandGoalScreen from './screens/HabitandGoalScreen';
import AddTaskScreen from './screens/AddTaskScreen';
import Toast from 'react-native-toast-message';
import EntryPreviewScreen from './screens/EntryPreviewScreen';
import YourAudioScreen from './screens/Meditation/YourAudioScreen';
import AudioPlayer from './screens/Meditation/AudioPlayerScreen';
import FeaturedViewAllScreen from './screens/Meditation/FeaturedViewAllScreen';
import MeditationSessionDetail from './screens/Meditation/MeditationSessionDetail';
import AudioRecorderModal from './screens/Meditation/AudioRecorderModal';
import ProfileScreen from './screens/ProfileScreen'; 
import EditProfileScreen from './screens/EditProfileScreen';
import ContactSupportScreen from './screens/ContactSupportScreen';
import FAQsScreen from './screens/FAQsScreen';
const Stack = createNativeStackNavigator();


export default function App() {
  return (
    <>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{headerShown: false}}>
      <Stack.Screen name="HomeTabs" component={BottomNavTab}/>  
      <Stack.Screen name="Register" component={RegisterScreen}/>
      <Stack.Screen name="Login" component={LoginScreen}/>
      <Stack.Screen name="Splash" component={SplashScreen}/>
      <Stack.Screen name="Board" component={BoardingScreen}/>
      <Stack.Screen name="BottomNavTab" component={BottomNavTab}/>
      <Stack.Screen name="MoodCheckIn" component={MoodCheckInScreen}/>
      <Stack.Screen name="Notepad" component={NotepadScreen}/>
      <Stack.Screen name="HabitsandGoals" component={HabitandGoalScreen}/>
      <Stack.Screen name="AddTask" component={AddTaskScreen}/>
      <Stack.Screen name="EntryPreview" component={EntryPreviewScreen}/>
      <Stack.Screen name="YourAudioScreen" component={YourAudioScreen}/>
      <Stack.Screen name="AudioPlayerScreen" component={AudioPlayer}/>
      <Stack.Screen name="FeaturedViewAll" component={FeaturedViewAllScreen}/>
      <Stack.Screen name="MeditationSessionDetail" component={MeditationSessionDetail}/> 
      <Stack.Screen name="AudioRecordedModal" component={AudioRecorderModal}/>
      <Stack.Screen name="ProfileScreen" component={ProfileScreen}/>
      <Stack.Screen name="EditProfile" component={EditProfileScreen}/>
      <Stack.Screen name="ContactSupportScreen" component={ContactSupportScreen}/>
      <Stack.Screen name="FAQsScreen" component={FAQsScreen}/>

    

      </Stack.Navigator>
      <Toast/>
    </NavigationContainer>
    </>
  );
}
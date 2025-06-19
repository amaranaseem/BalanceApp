import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; 
import HomeScreen from './screens/HomeScreen';
import JournalScreen from './screens/JournalScreen';
import HabitandGoalScreen from './screens/HabitandGoalScreen';
import ProfileScreen from './screens/ProfileScreen';
import { Ionicons } from '@expo/vector-icons' 

const Tab = createBottomTabNavigator();

function BottomNavTab() {
    return(
        <Tab.Navigator 
        screenOptions={({route}) => ({
          tabBarIcon:({focused, color, size}) =>{
            let iconName;
            if (route.name === 'Home'){iconName = focused ? 'home' : 'home-outline';}
            else if (route.name === 'Journal'){iconName = focused ? 'book' : 'book-outline';}
            else if (route.name === 'Tasks'){iconName = focused ? 'clipboard' : 'clipboard-outline';}
            else if (route.name === 'Profile'){iconName = focused ? 'person' : 'person-outline';}
            return <Ionicons name={iconName} size={size} color={color}/>;
          },
          tabBarActiveTintColor: 'black', 
          tabBarInactiveTintColor: '#A58E74', 
          tabBarShowLabel: true,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: '#FBEDDD',
          height: 80,
          paddingBottom: 30,
          borderRadius: 30,
          elevation: 10,
        },
        headerShown: false,
        })}>

            <Tab.Screen name="Home" component={HomeScreen}/>
            <Tab.Screen name="Journal" component={JournalScreen}/>
            <Tab.Screen name="Tasks" component={HabitandGoalScreen}/>
            <Tab.Screen name="Profile" component={ProfileScreen}/>

        </Tab.Navigator>

    );
} 



export default BottomNavTab;



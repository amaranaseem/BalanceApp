import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = ({ navigation }) => {
  
  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      navigation.navigate('Login'); // replace 'Login' with your actual login screen name
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>ProfileScreen</Text>

      <TouchableOpacity onPress={handleLogout} style={{ position: 'absolute', right: 20 }}>
        <Ionicons name="log-out-outline" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
};


export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FAF9F6',
  },
});

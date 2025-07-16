import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { Ionicons} from '@expo/vector-icons';
import { doc, getDoc, collection, getDocs, updateDoc} from 'firebase/firestore';
import { db } from '../firebase';
import * as ImagePicker from 'expo-image-picker';


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

{/* Header */}
<View style={styles.topRow}>
  <TouchableOpacity style={styles.closeCircle} onPress={() => navigation.navigate('BottomNavTab', { screen: 'HomeScreen' })}>
  <Ionicons name="close" size={22} color="black" />
  </TouchableOpacity>
</View>

<ScrollView showsVerticalScrollIndicator = {false}>

{/*Profile pic and information */}
{userData && (
<>
<View style={styles.profileSection}>
<View style={styles.profileImageWrapper}>
<Image source={userData.profileImage ? { uri: userData.profileImage } : require('../assets/profilepic.png')} style={styles.profileImage}/>
</View>
<Text style={styles.name}>{userData.name}</Text>
<Text style={styles.username}>@{userData.username}</Text>
</View>

{/* Status Overview */}
<View style={styles.gridRow}>
<View style={styles.statCard}>
<Ionicons name="checkbox-outline" size={22} color="#50483D" />
<Text style={styles.statLabel}>Check-ins</Text>
<Text style={styles.statNumber}>{checkInCount}</Text>
</View>

<View style={styles.statCard}>
<Ionicons name="book-outline" size={22} color="#50483D" />
<Text style={styles.statLabel}>Journal</Text>
<Text style={styles.statNumber}>{journalCount}</Text>
</View>

<View style={styles.statCard}>
<Ionicons name="ribbon-outline" size={22} color="#50483D" />
<Text style={styles.statLabel}>Streaks</Text>
<Text style={styles.statNumber}>{streakCount}</Text>
</View>
</View>
</>
)}

{/* Settings Button */}
<TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('SettingsScreen')}>
<Ionicons name="settings-outline" size={18} color="#50483D" />
<Text style={styles.settingsText}>Settings</Text>
</TouchableOpacity>

{/* Profile Edit Button */}
<TouchableOpacity style={styles.settingsButton} onPress={() => {
setIsEditing(true);
setNewUsername(userData.username || '');
}}>
<Text style={styles.settingsText}>Edit Profile</Text>
</TouchableOpacity>

{/* Logout */}
<TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
<Ionicons name="log-out-outline" size={20} color="#fff" />
<Text style={styles.logoutText}>Logout</Text>
</TouchableOpacity>
</ScrollView>

{isEditing && (
<View style={styles.modalOverlay}>
<View style={styles.modalContainer}>
<Text style={styles.modalTitle}>Edit Profile</Text>

<TouchableOpacity onPress={pickImage}>
<Image source={ image ? { uri: image } : userData?.profileImage ? { uri: userData.profileImage } : require('../assets/profilepic.png')}
style={styles.modalProfileImage} />

<Text style={styles.changePicText}>Change Profile Picture</Text>
</TouchableOpacity>

<TextInput
value={newUsername}
onChangeText={setNewUsername}
placeholder="Username"
style={styles.input}
/>

<View style={styles.modalButtonRow}>
<TouchableOpacity onPress={() => setIsEditing(false)} style={styles.cancelButton}>
<Text style={styles.cancelText}>Cancel</Text>
</TouchableOpacity>

<TouchableOpacity
onPress={handleSubmit}
style={styles.saveButton}
disabled={uploading}
>
<Text style={styles.saveText}>{uploading ? 'Saving...' : 'Save'}</Text>
</TouchableOpacity>
</View>
</View>
</View>
)}

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

topRow: {
  flexDirection: 'row-reverse',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  marginBottom: 20,
},

headerTextInput: {
  fontSize: 24,
  fontWeight: 'bold',
  flex: 1,
  color: '#50483D',
},
  
closeCircle: {
  width: 38,
  height: 38,
  borderRadius: 19,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#D8CAB8',
  opacity: 0.8,
},

profileSection: {
  alignItems: 'center',
  marginBottom: 30,
},

profileImageWrapper: {
  position: 'relative',
},

profileImage: {
  width: 100,
  height: 100,
  borderRadius: 50,
},

name: {
  fontSize: 20,
  fontWeight: '600',
  color: '#50483D',
  marginTop: 10,
},

username: {
  fontSize: 14,
  color: '#7F7B73',
},

statsBox: {
  backgroundColor: '#F1E7D7',
  padding: 16,
  borderRadius: 10,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 20,
},

statsLabel: {
  fontSize: 16,
  color: '#50483D',
  flex: 1,
  marginLeft: 10,
},

statsValue: {
  fontSize: 18,
  fontWeight: '600',
  color: '#50483D',
},

gridRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 30,
},

statCard: {
  backgroundColor: '#F1E7D7',
  width: '30%',
  paddingVertical: 16,
  borderRadius: 12,
  alignItems: 'center',
},

statLabel: {
  fontSize: 14,
  color: '#50483D',
  marginTop: 8,
},

statNumber: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#50483D',
  marginTop: 4,
},

settingsButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  borderColor: '#50483D',
  borderWidth: 1,
  borderRadius: 10,
  padding: 12,
  marginBottom: 20,
},

settingsText: {
  color: '#50483D',
  marginLeft: 8,
  fontSize: 16,
},

logoutBtn: {
  backgroundColor: '#D9534F',
  padding: 12,
  borderRadius: 10,
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
},

logoutText: {
  color: '#fff',
  fontSize: 16,
  marginLeft: 6,
},

modalOverlay: {
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
  zIndex: 10,
},

modalContainer: {
  backgroundColor: '#fff',
  padding: 20,
  borderRadius: 10,
  width: '100%',
},

modalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 10,
  textAlign: 'center',
  color: '#50483D',
},

modalProfileImage: {
  width: 80,
  height: 80,
  borderRadius: 40,
  alignSelf: 'center',
  marginBottom: 10,
},

changePicText: {
  textAlign: 'center',
  color: '#50483D',
  marginBottom: 10,
},

input: {
  borderBottomWidth: 1,
  borderColor: '#ccc',
  marginTop: 20,
  fontSize: 16,
  padding: 8,
},

modalButtonRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 20,
},

cancelButton: {
  padding: 10,
},

cancelText: {
  color: 'red',
},

saveButton: {
  padding: 10,
  backgroundColor: '#A8D5BA',
  borderRadius: 5,
},

saveText: {
  color: '#fff',
},

});

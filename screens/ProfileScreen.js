import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, Modal, Alert} from 'react-native';
import React, { useEffect, useState } from 'react';
import { getAuth, signOut, deleteUser} from 'firebase/auth';
import { Ionicons} from '@expo/vector-icons';
import {getFirestore, doc, getDoc, getDocs, deleteDoc} from 'firebase/firestore';
import { db } from '../firebase';
import EditProfileScreen from './EditProfileScreen';



const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  
  const auth = getAuth();
  const user = getAuth().currentUser;

  useEffect(() => {
  const fetchProfileData = async () => {
  if (!user) return;

  try {
   const userRef = doc(db, 'users', user.uid);
   const docSnap = await getDoc(userRef);
   if (docSnap.exists()) {
   setUserData(docSnap.data());
   }
  } catch (err) {
  console.error('Error fetching profile data:', err);
  }
 };

  fetchProfileData();
 }, []);

 // Reference:
 // Logout logic inspired from React Native Firebase Documentation
 // Link: https://rnfirebase.io/auth/usage#emailpassword-sign-in
 
 const handleLogout = async () => {
  Alert.alert("🔒Logout", "Are you sure you want to logout?", [
  {text: 'cancel', style: 'cancel' }, 
  {text: 'OK', onPress: async () => {
 
 try {
  const email = user?.email;
  await signOut(auth);
  console.log('User logged out:', email);
 
  navigation.replace('Login'); 
 } catch (error) {
    console.error('Logout error:', error);
    Alert.alert("Error", "Failed to log out. Please try again.");
    }
  }
  }
 ]);
 };
 
 const handleDeleteAccount = () => {
  Alert.alert( '⚠️ Delete Account','Are you sure you want to permanently delete your account and all your data?',
  [{ text: 'Cancel', style: 'cancel'},
  { text: 'Delete', style: 'destructive', onPress: async () => {
  try {
  if (user) {
  // Delete Firestore user data
   await deleteDoc(doc(db, 'users', user.uid));
   console.log('User deleted from Firebase.');
 
   // Delete Auth user
   await deleteUser(user);
   console.log('Account deleted.');

   navigation.replace('Login');
   }
  }catch (error) {
   console.error('Delete error:', error);
   Alert.alert('Error', 'Could not delete account. Try logging out and logging back in.');
     }
   },
 },]);
 };

return (
<View style={styles.container}>

{/* Header */}
<View style={styles.topRow}>

<TouchableOpacity onPress={() => navigation.navigate('BottomNavTab', { screen: 'HomeScreen' })}>
  <Ionicons name="chevron-back-outline" size={24} color="black" />
</TouchableOpacity>
</View>

<ScrollView showsVerticalScrollIndicator = {false}>

{/*Profile pic and information */}
{userData && (
<View style={styles.profileContainer}>
<Image
  source={userData.profileImage ? { uri: userData.profileImage } : require('../assets/profilepic.png')}
  style={styles.profileImage}
/>
<View style={styles.profileInfo}>
<Text style={styles.name}>{userData.name}</Text>
<Text style={styles.username}>@{userData.username}</Text>
</View>
</View>
)}

{/* Edit Profile */}
<TouchableOpacity style={styles.button} onPress={() => setEditProfileModalVisible(true)}>
<Ionicons name="pencil" size={16} color="#000"/>
<Text style={styles.text}>Edit Profile</Text>
</TouchableOpacity>

{/* FAQ */}
<TouchableOpacity style={styles.button} onPress={() => navigation.navigate('FAQsScreen')}>
<Ionicons name="information-circle-outline" size={23} color="#000" />
<Text style={styles.text}>FAQs</Text>
</TouchableOpacity>

{/* Contact Support */}
<TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ContactSupportScreen')}>
<Ionicons name="headset-outline" size={20} color="#000" />
<Text style={styles.text}>Contact Support</Text>
</TouchableOpacity>

{/* Delete Account */}
<TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
  <Ionicons name="trash" size={20} color="#E94F4F" />
<Text style={styles.deleteText}>Delete Account</Text>
</TouchableOpacity>


{/* Logout */}
<TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
<Ionicons name="log-out-outline" size={20} color="#000" />
<Text style={styles.btnText}>Logout</Text>
</TouchableOpacity>
</ScrollView>

{/* Modal for editing profile*/}
<Modal visible={editProfileModalVisible} animationType="fade" transparent>
<View style={styles.modalBackground}>
<View style={styles.modalContainer}>
<EditProfileScreen
  userData={userData}
  setUserData={setUserData}
  closeModal={() => setEditProfileModalVisible(false)}
/>
</View>
</View>
</Modal>
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
  backgroundColor: '#ffff',
},

topRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},
  
profileImage: {
  width: 180,
  height: 180,
  borderRadius: 100,
  borderWidth: 0.5,
  marginBottom: 10
},

profileContainer:{
  alignItems: 'center',
  marginTop: 30,
},

name: {
  fontSize: 26,
  fontWeight: '600',
  color: '#50483D',
  marginTop: 10,
  textAlign: 'center'
},

username: {
  fontSize: 16,
  color: '#7F7B73',
  textAlign: 'center', 
  marginBottom: 50
},

modalBackground: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},

modalContainer: {
  width: '90%',
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 20,
},

button: {
  padding: 12,
  borderRadius: 10,
  flexDirection: 'row',
  justifyContent: 'flex-start',
  gap: 12, 
  borderWidth: 1,
  borderColor: '#000',
  marginBottom: 20,
},

logoutBtn: {
  padding: 12,
  borderRadius: 10,
  flexDirection: 'row',
  justifyContent: 'flex-start',
  gap: 12, 
  marginBottom: 20,
  backgroundColor: '#bee1ccff', 
},

text: {
  color: '#000',
  fontSize: 16,
  fontWeight: '500', 
}, 

btnText: {
  color: '#000',
  fontSize: 16,
  marginLeft: 6,
  fontWeight: '500'
},  

deleteBtn: {
  backgroundColor: '#D9D9D9',
  padding: 12,
  paddingLeft: 16,
  borderRadius: 10,
  flexDirection: 'row',
  justifyContent: 'flex-start',
  gap: 12, 
  marginBottom: 20,
  marginTop: 10, 
},

deleteText:{
  color: '#E94F4F',
  fontSize: 16,
  marginLeft: 6,
  fontWeight: '500', 
}

});

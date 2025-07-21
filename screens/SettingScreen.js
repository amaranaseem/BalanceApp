import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, signOut, deleteUser } from 'firebase/auth';
import { getFirestore, doc, deleteDoc } from 'firebase/firestore';
import app from '../firebase';

const db = getFirestore(app);

const SettingScreen = ({navigation}) => {
const auth = getAuth();
const user = auth.currentUser;


const handleLogout = async () => {
Alert.alert("Logout", "Are you sure you want to logout?", [
  { text: 'cancel', style: 'cancel' }, 

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
  Alert.alert( 'Delete Account','Are you sure you want to permanently delete your account and all your data?',
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
    } catch (error) {
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
<Text style={styles.headerTextInput}>Settings</Text>
<TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')}>
<Ionicons name="chevron-back-outline" size={26} color="black" />
</TouchableOpacity>
</View>

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
  <Ionicons name="trash-outline" size={20} color="#E94F4F" />
<Text style={styles.deleteText}>Delete Account</Text>
</TouchableOpacity>


{/* Logout */}
<TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
<Ionicons name="log-out-outline" size={20} color="#000" />
<Text style={styles.btnText}>Logout</Text>
</TouchableOpacity>
</View>
  )
}

export default SettingScreen

const styles = StyleSheet.create({
container: {
  flex: 1,
  paddingTop: 60,
  paddingHorizontal: 20,
  paddingVertical: 20,
  backgroundColor: '#ffffff',
},

topRow: {
  flexDirection: 'row-reverse',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 100,
  marginBottom: 60,
},

headerTextInput: {
  fontSize: 28,
  fontWeight: 'bold',
  flex: 1,
  color: '#000',
  alignSelf: 'center'
},

button: {
  padding: 12,
  borderRadius: 10,
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'center',
  gap: 12, 
  borderWidth: 1,
  borderColor: '#000',
  marginBottom: 20,
},

logoutBtn: {
  backgroundColor: '#A8D5BA',
  padding: 12,
  borderRadius: 10,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12, 
  marginBottom: 20,
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
  borderRadius: 10,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12, 
  marginBottom: 20,
  marginTop: 40
},

deleteText:{
  color: '#E94F4F',
  fontSize: 16,
  marginLeft: 6,
  fontWeight: '500'
}

})
import React, { useState } from 'react'
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Image, ScrollView, Platform, TouchableWithoutFeedback, Keyboard} from 'react-native'
import { auth, db} from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword,setShowPassword ]= useState(false);

// References:
// Login logic influenced by React Native Firebase and "Super Easy React Native Authentication with Firebase" youtube video. timestamp: 7:00 
// Video Link: https://www.youtube.com/watch?v=ONAVmsGW6-M&t=439s 
// Document Link: https://rnfirebase.io/auth/usage#emailpassword-sign-in 

{/*User Authentication with error handling*/}
const handleLogin = async () => {
  if (!email || !password) {
    alert('All fields are required');
    return;
  }
  // Fetching username from Firebase if avaliable
    try {
	  const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
  
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    let username = 'User';
    if (userDocSnap.exists()) {
      username = userDocSnap.data().username || 'User';
    }

    console.log('User logged in:', user.email);

    Toast.show({
      type: 'success',
      text1: `Welcome back, ${username}!`,
    });

    navigation.navigate('HomeTabs');
  } catch (error) {
    console.log('Login error:', error);
    console.log('Error code:', error.code);
  
  // Error handling for wrong/invalid password, email  
  switch (error.code) {
    case 'auth/invalid-credential':
      alert('Email or password is incorrect.');
    break;
    case 'auth/user-not-found':
      alert('No account found with this email.');
    break;
    case 'auth/wrong-password':
      alert('Incorrect password.');
    break;
    case 'auth/invalid-email':
      alert('Invalid email format.');
    break;
    default:
      alert('Error: ' + error.message);
  }
}
};

return (
  <KeyboardAvoidingView style={styles.container}  behavior={Platform.OS === 'android' ? 'padding' : 'height'}>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
  <ScrollView contentContainerStyle={styles.scrollcontainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator= {false}>
  
  {/* Logo  */}
  <View style={styles.logoContainer}>
  <Image source={require('../assets/logo.jpg')} style={styles.logo} />
  <Text style={styles.appName}>Balance</Text>
  </View>

  <Text style={styles.headerText}>Login</Text>
         
  {/* Email Field */}
  <View style={styles.inputWrapper}>
  <Text style={styles.inputLabel}>Email</Text>
  <View style={styles.inputContainer}>
    <Ionicons name="mail-outline" size={20} color="#A58E74" style={styles.icon} />
  <TextInput
    style={styles.inputText}
    placeholder="abc@gmail.com"
    value={email}
    onChangeText={setEmail}
    keyboardType="email-address"
    autoCapitalize="none"
  />
  </View>
  </View>

  {/* Password Field */}
  <View style={styles.inputWrapper}>
  <Text style={styles.inputLabel}>Password</Text>
  <View style={styles.inputContainer}>
    <Ionicons name="lock-closed-outline" size={20} color="#A58E74" style={styles.icon} />
  <TextInput
    style={styles.inputText}
    placeholder="*******"
    value={password}
    onChangeText={setPassword}
    secureTextEntry={!showPassword}
  />
  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
      <Ionicons name={!showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#A58E74" />
  </TouchableOpacity>
  </View>
  </View>

  {/* Login Button */}  
  <View style={styles.buttoncontainer}>
  <TouchableOpacity style={styles.button} onPress={handleLogin}>
  <Text style={styles.buttonText}>Login</Text>
  </TouchableOpacity>
  </View>

  {/* Signup Button */}  
  <View style={styles.siginContainer}>
  <TouchableOpacity style={styles.signinButton} onPress={() => navigation.navigate('Register')}>
  <Text style={styles.buttonText}>Sign Up</Text>
  </TouchableOpacity>
  </View>

  </ScrollView>
  </TouchableWithoutFeedback>
  </KeyboardAvoidingView>
  );
};

export default LoginScreen

const styles = StyleSheet.create({
container: {
  flex: 1,
  justifyContent: 'flex-start',
  backgroundColor: '#ffffff', 
  paddingHorizontal: 5,
  paddingTop: 80,
},

scrollcontainer:{
  flexGrow: 1,
  justifyContent: 'flex-start',
  paddingHorizontal: 20, 
},

logoContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  alignSelf: 'flex-start',
  marginBottom: 40,
},

logo: {
  width: 60,
  height: 60,
  borderRadius: 100,
  marginRight: 10,
},

appName: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#50483D',
},

headerText:{
  fontSize: 30,
  fontWeight: 'bold',
  color: '#50483D',
  alignSelf: 'flex-start',
  marginBottom: 45
}, 

inputWrapper: {
  width: '100%',
  marginBottom: 15,
},

inputLabel: {
  fontSize: 14,
  color: '#6E665B',
  marginBottom: 10,
  marginLeft: 10,
},

inputContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  width: '100%',
  height: 50,
  backgroundColor: '#FAEDDD',
  borderRadius: 20,
  paddingHorizontal: 15,
  marginBottom: 10,
  justifyContent: 'space-between'
},

icon: {
  marginRight: 10,
},

inputText: {
  fontSize: 14,
  color: 'black',
  flex: 1, 
  width: '100%'
},

buttonText: {
  fontSize: 16,
  color: '#000',
  fontWeight: 'bold',
},

buttoncontainer:{
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 30,
},

button:{
  padding: 12,
  backgroundColor: '#A8D5BA',
  width: '100%',
  alignItems: 'center',
  position:'absolute', 
  borderRadius: 14,
  marginTop: 40,
  marginBottom: 30,
},

siginContainer:{
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 30,
},

signinButton:{
  padding: 12,
  borderColor: '#A8D5BA',
  width: '100%',
  alignItems: 'center',
  borderRadius: 14,
  marginTop: 15,
  marginBottom: 30,
  borderWidth: 1,
},

});
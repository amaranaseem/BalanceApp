import React, { useState } from 'react'
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Image, ScrollView, Platform, TouchableWithoutFeedback, Keyboard} from 'react-native'
import { auth, db} from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { sendPasswordResetEmail } from 'firebase/auth';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword,setShowPassword ]= useState(false);


{/*User Authentication with error handling*/}
const handleLogin = async () => {
  if (!email || !password) {
    alert('All fields are required');
    return;
  }
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

{/* Password reset  */}
const handlePasswordReset = async () => {
  if (!email) {
    alert('Please enter your email');
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    console.log('Password reset email sent to:', email);
  } catch (error) {
    console.log('Password reset error:', error);

    if (error.code === 'auth/user-not-found') {
      alert('No account found with this email');
    } else if (error.code === 'auth/invalid-email') {
      alert('Invalid email address');
    } else {
      alert(error.message);
    }
  }
  
  Toast.show({
  type: 'info',
  text1: 'Password reset link sent!',
  text2: `Check your inbox: ${email}`,
});
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
  <Text style={styles.subText}>Get started for free</Text>
         
  {/* Email Field */}
  <View style={styles.inputWrapper}>
  <Text style={styles.inputLabel}>Email</Text>
  <View style={styles.inputContainer}>
    <Ionicons name="mail-outline" size={20} color="#6E665B" style={styles.icon} />
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
    <Ionicons name="lock-closed-outline" size={20} color="#6E665B" style={styles.icon} />
  <TextInput
    style={styles.inputText}
    placeholder="*******"
    value={password}
    onChangeText={setPassword}
    secureTextEntry={!showPassword}
  />
  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
      <Ionicons name={!showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#6E665B" />
  </TouchableOpacity>

  {/* Forgot Password Link */}
  </View>
  <TouchableOpacity style={styles.forgotTextContainer} onPress={handlePasswordReset}>
  <Text style={styles.forgotText}>Forgot Password?</Text>
  </TouchableOpacity>
  </View>

  {/* Login Button */}  
  <View style={styles.buttoncontainer}>
  <TouchableOpacity style={styles.button} onPress={handleLogin}>
  <Text style={styles.buttonText}>Login</Text>
  </TouchableOpacity>
  </View>

  {/* Signup Link */}
  <View style={styles.linkcontainer}>
  <TouchableOpacity onPress={() => navigation.navigate('Register')}>
  <Text style={styles.linkText}>Not a member? Register</Text>
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
  backgroundColor: '#FAF9F6', 
  paddingHorizontal: 5,
  paddingTop: 90,
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
  width: 50,
  height: 60,
  borderRadius: 20,
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
}, 

subText:{
  fontSize: 14,
  color: '#7A6F5F',
  marginBottom: 25,
  alignSelf: 'flex-start',
  marginTop: 15,
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
  backgroundColor: '#EFE8DD',
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
  flex: 1
},

forgotTextContainer: {
  alignSelf: 'flex-end',
  marginTop: 6,
  marginRight: 10,
},

forgotText: {
  fontSize: 12,
  color: 'black',
},

buttonText: {
  fontSize: 16,
  color: '#3C4F46',
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
  elevation: 2,
},

linkText:{
  fontSize: 14,
  marginTop: 20,
  textAlign: 'left',
}, 

linkcontainer:{
  alignSelf: 'flex-start',
  marginTop: 35,
  marginLeft: 10,
},

});
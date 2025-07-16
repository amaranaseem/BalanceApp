import React, { useState } from 'react'
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Image, ScrollView, Platform} from 'react-native'
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile} from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';


const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


{/*User Authentication with error handling*/}
const handleRegister = async () => {
  if (!email || !password || !confirmPassword) {
    alert('All fields are required');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Please enter a valid email');
    return;
  }

  if (password.length < 6) {
    alert('Password must be at least 6 characters');
    return;
  }

  if (password !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('User registered:', userCredential.user.uid);
    navigation.navigate('Board');
  } catch (error) {
    console.log('Registration error:', error);

    if (error.code === 'auth/email-already-in-use') {
      alert('This email is already in use.');
    } else if (error.code === 'auth/weak-password') {
      alert('The password is too weak.');
    } else {
      alert('Registration failed: ' + error.message);
    }
  }
};

return (
  <KeyboardAvoidingView style={styles.container}  behavior={Platform.OS === 'android' ? 'padding' : 'height'}>
  <ScrollView contentContainerStyle={styles.scrollcontainer} keyboardShouldPersistTaps="handled"showsVerticalScrollIndicator= {false}>
  {/* Logo */}
  <View style={styles.logoContainer}>
  <Image source={require('../assets/logo.jpg')} style={styles.logo} />
  <Text style={styles.appName}>Balance</Text>
  </View>

  <Text style={styles.headerText}>Register</Text>
  <Text style={styles.subText}>Start your journey with us.</Text>
         
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
  placeholder="******"
  value={password}
  onChangeText={setPassword}
  secureTextEntry       
  />
  </View>
  </View>

  {/* Confirm Password Field */}
  <View style={styles.inputWrapper}>
  <Text style={styles.inputLabel}>Confirm Password</Text>
  <View style={styles.inputContainer}>
     <Ionicons name="lock-closed-outline" size={20} color="#6E665B" style={styles.icon} />
  <TextInput
  style={styles.inputText}
  placeholder="******"
  value={confirmPassword}
  onChangeText={setConfirmPassword}
  secureTextEntry       
  />
  </View>
  </View>

  {/* Register Button */}  
  <View style={styles.buttoncontainer}>
  <TouchableOpacity style={styles.button} onPress={handleRegister}>
  <Text style={styles.buttonText}>Continue</Text>
  </TouchableOpacity>
  </View>

  {/* Login Link */}
  <View style={styles.linkcontainer}>
  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
  <Text style={styles.linkText}>Already a member? Login</Text>
  </TouchableOpacity>
  </View>
  </ScrollView>
  </KeyboardAvoidingView>
 );
};

export default RegisterScreen

const styles = StyleSheet.create({
container: {
  flex: 1,
  justifyContent: 'flex-start',
  backgroundColor: '#FAF9F6', 
  paddingHorizontal: 5,
  paddingTop: 90,
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
},

inputText: {
  fontSize: 14,
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

scrollcontainer:{
  flexGrow: 1,
  justifyContent: 'flex-start',
  paddingHorizontal: 20, 
},

icon:{
  marginRight: 10
}

});
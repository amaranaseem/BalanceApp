import React, { useState } from 'react'
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Image, ScrollView, Platform, TouchableWithoutFeedback, Keyboard} from 'react-native'
import { auth } from '../firebase';
import { createUserWithEmailAndPassword} from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

// References:
// Login logic influenced by React Native Firebase 
// Link: https://rnfirebase.io/auth/usage#emailpassword-sign-in 

 {/*User Authentication with error handling*/}
 const handleRegister = async () => {
  if (!email || !password || !confirmPassword) {
    alert('All fields are required');
    return;
  }

  //Email format: checks for whitespace, @ and domain ".com"
  // fomat: example@domain.com 
 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Invalid Email: example@domain.com format should be followed');
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
    // registering the user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('User registered:', userCredential.user.uid);

    navigation.navigate('Board');
  } catch (error) {
    console.log('Registration error:', error);

    // error handling
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
    <Ionicons name="lock-closed-outline" size={20} color="#A58E74" style={styles.icon} />
    <TextInput
      style={styles.inputText}
      placeholder="******"
      value={password}
      onChangeText={setPassword}
      secureTextEntry= {!showPassword}        
    />
    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#A58E74" />
    </TouchableOpacity>
    </View>
  </View>

  {/* Confirm Password Field */}
  <View style={styles.inputWrapper}>
    <Text style={styles.inputLabel}>Confirm Password</Text>
    <View style={styles.inputContainer}>
      <Ionicons name="lock-closed-outline" size={20} color="#A58E74" style={styles.icon} />
    <TextInput
      style={styles.inputText}
      placeholder="******"
      value={confirmPassword}
      onChangeText={setConfirmPassword}
      secureTextEntry= {!showConfirmPassword}     
    />
    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#A58E74" />
    </TouchableOpacity>
    </View>
  </View>

  {/* Register Button */}  
  <View style={styles.buttoncontainer}>
    <TouchableOpacity style={styles.button} onPress={handleRegister}>
    <Text style={styles.buttonText}>Continue</Text>
    </TouchableOpacity>
  </View>

  {/* Login Button */}  
  <View style={styles.loginContainer}>
    <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
    <Text style={styles.buttonText}>Login</Text>
    </TouchableOpacity>
  </View>

  </ScrollView>
  </TouchableWithoutFeedback>
  </KeyboardAvoidingView>
 );
};

export default RegisterScreen

const styles = StyleSheet.create({
container: {
  flex: 1,
  justifyContent: 'flex-start',
  backgroundColor: '#FFFFFF', 
  paddingHorizontal: 5,
  paddingTop: 80,
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
  backgroundColor: '#FAEDDD',
  borderRadius: 20,
  paddingHorizontal: 15,
  marginBottom: 10,
  justifyContent: 'space-between'
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
  alignItems: 'center'
},

buttoncontainer:{
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 40,
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

scrollcontainer:{
  flexGrow: 1,
  justifyContent: 'flex-start',
  paddingHorizontal: 20, 
},

icon:{
  marginRight: 10
}, 

loginButton:{
  padding: 12,
  borderColor: '#A8D5BA',
  width: '100%',
  alignItems: 'center',
  borderRadius: 14,
  marginTop: 40,
  marginBottom: 30,
  borderWidth: 1,
}, 

loginContainer:{
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 10,
},

});
import React, { useState } from 'react'
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Image} from 'react-native'
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { sendPasswordResetEmail } from 'firebase/auth';
import Toast from 'react-native-toast-message';


const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


{/*User Authentication with error handling*/}
const handleLogin = async () => {
  if (!email || !password) {
    alert('Please enter both email and password');
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const name = user.displayName || 'User';

    console.log('User logged in:', user.email);

    Toast.show({
      type: 'success',
      text1: `Welcome back, ${name}!`,
    });


    navigation.navigate('HomeTabs');
  } catch (error) {
    console.log('Login error:', error);

    if (error.code === 'auth/user-not-found') {
      alert('No account found with this email');
    } else if (error.code === 'auth/wrong-password') {
      alert('Incorrect password');
    } else {
      alert(error.message);
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
   <KeyboardAvoidingView style={styles.container} behavior='padding'>

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
            <TextInput
              style={styles.inputText}
              placeholder="*******"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

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
        
       </KeyboardAvoidingView>
     );
   };

export default LoginScreen

const styles = StyleSheet.create({
container: {
  flex: 1,
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  backgroundColor: '#FAF9F6', 
  paddingHorizontal: 20,
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
  width: '100%',
  height: 50,
  backgroundColor: '#EFE8DD',
  borderRadius: 20,
  paddingHorizontal: 15,
  justifyContent: 'center',
},

inputText: {
  fontSize: 14,
  color: 'black',
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
  width: '90%',
  alignItems: 'center',
  position:'absolute', 
  borderRadius: 20,
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
import React, { useState } from 'react'
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Image} from 'react-native'
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile} from 'firebase/auth';
import Toast from 'react-native-toast-message';


const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

{/*User Authentication with error handling for password*/}
const handleRegister = async () => {
  if (!username || !email || !password) {
    alert('All fields are required');
    return;
  }

  if (password.length < 6) {
    alert('Password must be at least 6 characters');
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(userCredential.user, { displayName: username });
    console.log('Username set as:', username);

    Toast.show({
    type: 'success',
    text1: `Welcome ${username} to Balance!`,
    });

    navigation.navigate('HomeTabs');
  } catch (error) {
    console.log('Registration error:', error);

    if (error.code === 'auth/weak-password') {
      alert('Password should be 6 character long');
    } else {
      alert(error.message);
    }
  }
};



  return (
   <KeyboardAvoidingView style={styles.container} behavior='padding'>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image source={require('../assets/logo.jpg')} style={styles.logo} />
          <Text style={styles.appName}>Balance</Text>
        </View>

        <Text style={styles.headerText}>Register</Text>
        <Text style={styles.subText}>Start your journey with us.</Text>

         {/* Username Field */}
        <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>Username</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputText}
            placeholder="tester"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>
      </View>
         
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
              placeholder="******"
              value={password}
              onChangeText={setPassword}
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
        
       </KeyboardAvoidingView>
     );
   };

export default RegisterScreen

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
import React, { useState } from 'react'
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView} from 'react-native'

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  return (
   <KeyboardAvoidingView style={styles.container} behavior='padding'>
         <Text style={styles.headerText}>Signup</Text>
         
         <View style={styles.inputContainer}>
           <TextInput 
             style={styles.inputText}
             placeholder= "Email"
             value={email}
             onChangeText={setEmail}
           />
           </View>

           <View style={styles.inputContainer}>
           <TextInput style={styles.inputText}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
           />
         </View>

         <View style={styles.buttoncontainer} >
           <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('HomeTabs')}>
           <Text style={styles.buttonText}>Register</Text>
           </TouchableOpacity>
         </View>

          <View style={styles.linkcontainer}>
            <Text style={styles.linkText}>
                Already a member? Login
            </Text>
          </View>
        
   
       </KeyboardAvoidingView>
     );
   };

export default RegisterScreen

const styles = StyleSheet.create({
  container: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#FAF9F6', 
},

headerText:{
  fontSize: 30,
}, 

subText:{
  fontSize: 16,
},

buttonText: {
  fontSize: 16,
  color: '#fff',
  
},

buttoncontainer:{
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 40,
},

button:{
  padding: 12,
  backgroundColor: '#077ff4',
  width: '80%',
  alignItems: 'center',
  position:'absolute'
},

linkText:{
  fontSize: 14,
}, 

linkcontainer:{
marginTop: 40,
},

inputText:{
 fontSize: 12,
 marginBottom: 20,
 paddingHorizontal: 15,
 paddingVertical: 10,
 backgroundColor: '#fff',
},

inputContainer:{
 width: '80%',
 borderWidth: 1, 
 marginTop: 10, 
 paddingHorizontal: 10,
 
},

});
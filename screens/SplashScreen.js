import React, { useEffect } from 'react';
import { Text, StyleSheet, View, Image, ImageBackground} from 'react-native';

export default function SplashScreen({navigation}) {

useEffect(() => {
  const timeout = setTimeout(() => {
   navigation.replace('Login'); 
 }, 4000); 
}, []);
    
return (
 <ImageBackground
  source={require('../assets/bkgimage.jpg')}
  style={styles.background}
  resizeMode="cover">

 <View style={styles.container}>
 <Image source={require("../assets/logo.jpg")} style={styles.logo} resizeMode="contain" />
   <Text style={styles.logoText}>Balance</Text>
 </View>
</ImageBackground>
 );
}
  
  
const styles = StyleSheet.create({
container: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20, 
},
  
logo:{
  width: 180, 
  height: 180, 
  borderRadius: 100,
  marginBottom: 15, 
  borderWidth: 1,
  borderColor: '#D8CAB8',
},
  
logoText:{
  fontSize: 50,
  fontWeight: '600', 
  color: '#4A4A4A', 
  letterSpacing: 1,
  fontStyle: 'Bold',
  textTransform: 'capitalize',
},

background: {
  flex: 1,
  justifyContent: 'center',
},
 
});
  
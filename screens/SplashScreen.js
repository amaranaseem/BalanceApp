import React from 'react';
import { Text, StyleSheet, View, Image, TouchableOpacity} from 'react-native';

export default function SplashScreen() {
    
  return (
      <View style={styles.container}>
          <Image 
            source={require("../assets/logo.png")} 
            style={styles.logo} 
            resizeMode="contain" />
          <Text style={styles.logoText}>Balance</Text>

          <TouchableOpacity 
          style={styles.button}>
          <Text style={styles.buttonText}>Explore Now</Text>
        </TouchableOpacity>

      </View>
    );
  }
  
  
  const styles = StyleSheet.create({
  container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20, 
      backgroundColor: '#ff',
    },
  
  logo:{
      width: 180, 
      height: 180, 
      borderRadius: 100,
      marginBottom: 15    
  },
  
  logoText:{
      fontSize: 60,
      color: '#50483D',
      alignItems: 'center',
      fontWeight: 'bold',
  },

  button:{
    borderWidth: 1,
    width: '80%',
    padding: 10,
    alignItems:'center',
  },
  
  });
  

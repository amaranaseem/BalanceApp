import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>HomeScreen</Text>
    </View>
  )
}

const styles = StyleSheet.create({
container: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20, 
  backgroundColor: '#ff',
},

headerText:{
  fontSize: 30,
},   
})
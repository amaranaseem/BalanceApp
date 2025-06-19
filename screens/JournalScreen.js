import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const JournalScreen = () => {
  return (
    <View style={styles.container}>
          <Text style={styles.headerText}>Journal</Text>
        </View>
  )
}

export default JournalScreen

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
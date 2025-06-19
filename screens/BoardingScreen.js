import { StyleSheet,View, Text } from 'react-native'
import React from 'react'

const BoardingScreen = () => {
  return (
       <View style={styles.container}>
          <Text style={styles.headerText}>What brings you Balance App?</Text>
            <View style={styles.inputContainer}> <Text>Track my mood</Text> </View>    
            <View style={styles.inputContainer}><Text>Start Jounaling</Text></View>
            <View style={styles.inputContainer}> <Text>Reduce Stress</Text></View>
      </View>
    )
}

export default BoardingScreen

const styles = StyleSheet.create({
container: {
      flex: 1,
      alignItems: 'stretch',
      padding: 20, 
      backgroundColor: '#ff',
    },
     headerText:{
    fontSize: 30,},   

inputContainer:{
    width: '90%',
    borderWidth: 1, 
    marginTop: 10, 
    padding: 10,

}, 

})
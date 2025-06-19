import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const HabitandGoalScreen = () => {
  return (
   <View style={styles.container}>
         <Text style={styles.headerText}>HabitandGoalScreen</Text>
       </View>
  )
}

export default HabitandGoalScreen

const styles = StyleSheet.create({container: {
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
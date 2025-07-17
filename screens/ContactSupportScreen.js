import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons';

const ContactSupportScreen = ({navigation}) => {
  return (
  <View style={styles.container}>
  
  {/* Header */}
  <View style={styles.topRow}>   
  <Text style={styles.headerTextInput}>Customer Support</Text>
  <TouchableOpacity onPress={() => navigation.navigate('SettingScreen')}>
  <Ionicons name="chevron-back-outline" size={26} color="black" />
  </TouchableOpacity>
  </View>

<View style={styles.questionContainer}>
    <Text style={styles.heading}>📞 Contact Us</Text>
    <View style={styles.row}>
    <Text style={styles.title}>Email:</Text>
    <Text style={styles.para}>support@balanceapp.com</Text>
    </View>

    <View style={styles.row}>
    <Text style={styles.title}>Support Hours:</Text>
    <Text style={styles.para}>9 AM – 6 PM, Mon - Sat</Text>
    </View>

     <View style={styles.row}>
    <Text style={styles.title}>Response Time: </Text>
    <Text style={styles.para}>Within 24 hours</Text>
    </View>

</View>

</View>
  )
};

export default ContactSupportScreen


const styles = StyleSheet.create({
container: {
  flex: 1,
  paddingTop: 60,
  paddingHorizontal: 20,
  paddingVertical: 20,
  backgroundColor: '#FAF9F6',
},

topRow: {
  flexDirection: 'row-reverse',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 60,
  marginBottom: 60,
},

headerTextInput: {
  fontSize: 24,
  fontWeight: 'bold',
  flex: 1,
  color: '#000',
},

heading: {
  fontSize: 16,
  fontWeight: '600',
  color: 'black',
  marginBottom: 20
},

title: {
  fontWeight: 'bold',
  marginRight: 6,
  color: '#000',
  fontSize: 14
},

para:{
  color: '#333',
  fontSize: 14
}, 

questionContainer:{
  borderWidth: 0.5,
  borderColor: 'black',
  width: '100%',
  padding: 12,
  marginBottom: 12,
  borderRadius: 10, 
  alignItems: 'center'
},

row: {
  flexDirection: 'row',
  marginBottom: 10,
},

})
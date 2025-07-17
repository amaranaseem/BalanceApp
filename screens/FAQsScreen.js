import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons';

const FAQsScreen = ({navigation}) => {
  return (
  <View style={styles.container}>
  
  {/* Header */}
  <View style={styles.topRow}>   
  <Text style={styles.headerTextInput}>FAQs</Text>
  <TouchableOpacity onPress={() => navigation.navigate('SettingScreen')}>
  <Ionicons name="chevron-back-outline" size={26} color="black" />
  </TouchableOpacity>
  </View>
  
{/*Question 1 */}
<ScrollView>
<View style={styles.questionContainer}>
   <Text style={styles.title}>1. What is this app about?</Text>
   <Text style={styles.para}>Balance App is designed to helps you track your mood, build habits, reflect on your daily experiences and . 
   support your personal growth.</Text> 
</View>

{/*Question 2 */}
<View style={styles.questionContainer}>
   <Text style={styles.title}>2. How do I get started?</Text>
   <Text style={styles.para}>After signing up, you can start by:</Text> 
  <Text style={styles.bulletPoint}>- Logging your mood from the home screen.</Text>
  <Text style={styles.bulletPoint}>- Creating habits or daily tasks.</Text>
  <Text style={styles.bulletPoint}>- Checking your progress and insights from the dashboard.</Text>

</View>

{/*Question 3 */}
<View style={styles.questionContainer}>
   <Text style={styles.title}>3. Is my data private and secure?</Text>
   <Text style={styles.para}>Yes. Your data is securely stored using Firebase and is only accessible by you. 
    We do not share your personal information or mood data with any third parties..</Text> 
</View>

{/*Question 4 */}
<View style={styles.questionContainer}>
   <Text style={styles.title}>4. Can I reset my progress or delete my account?</Text>
   <Text style={styles.para}>Yes. You can permanently delete your account and data from the Settings page. 
    This action is irreversible.</Text> 
</View>

{/*Question 6 */}
<View style={styles.questionContainer}>
   <Text style={styles.title}>6. Can I use the app offline?</Text>
   <Text style={styles.para}>You can use the app offline, but changes made won't be saved untill online. </Text> 
</View>

{/*Question 7 */}
<View style={styles.questionContainer}>
   <Text style={styles.title}>7. Is the app free to you</Text>
   <Text style={styles.para}>Yes, the core features are free.</Text> 
</View>

{/*Question 8 */}
<View style={styles.questionContainer}>
   <Text style={styles.title}>8. How can I report a bug or share feedback?</Text>
   <Text style={styles.para}>You can reach out to us directly from the app by going to Customer Support.</Text> 
</View>


</ScrollView>
  </View>
  )
};

export default FAQsScreen

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
  gap: 120,
  marginBottom: 60,
},

headerTextInput: {
  fontSize: 26,
  fontWeight: 'bold',
  flex: 1,
  color: '#000',
},

title: {
  fontSize: 16,
  fontWeight: '600',
  color: 'black',
},

para:{
  fontSize: 14,
  color: 'black',
  marginTop: 10,
  marginBottom: 5
}, 

questionContainer:{
  borderWidth: 0.5,
  borderColor: 'black',
  width: '100%',
  padding: 12,
  marginBottom: 12,
  borderRadius: 3
}, 

bulletPoint: {
  fontSize: 14,
  color: 'black',
  lineHeight: 22,
  marginBottom: 4,
}

})
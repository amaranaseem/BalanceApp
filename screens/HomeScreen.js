import { StyleSheet, Text, View, Image, TouchableOpacity,ScrollView } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'

const HomeScreen = () => {
  return (
   <ScrollView style={styles.container}>
    
      <View style={styles.topRow}>
        <Ionicons name="notifications-outline" size={20} color="#A58E74" />
      </View>

    {/* welcome card*/}
    <View style={styles.welcomecard}>
      <View style={styles.textContainer}>
          <Text style={styles.h2}>Hey, Tester</Text>
          <Text style={styles.subtitle}>
            Let's take a mindful pause and see how you're doing today.
          </Text>
        </View>
    <Image source={require('../assets/meditation.jpg')} style={styles.illustration}/>
    </View>
    
    {/* mood card*/}
    <View>
     <TouchableOpacity style={styles.moodCard} onPress={()=> navigation.navigate('Journal')}>
      <Text style={styles.bodytext}>How are you feeling today?</Text>
       <Ionicons name="chevron-forward" size={20} color="black"/>
     </TouchableOpacity>
     </View>
              
  </ScrollView>

  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    paddingHorizontal: 20,
    paddingTop: 50,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 320,
    alignItems: 'center',
  },

  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  streakText: {
    marginLeft: 4,
    fontWeight: '600',
    fontSize: 14,
    color: '#50483D',
  },

  greetingContainer: {
    marginVertical: 10,
  },

  textContainer: {
    flex: 1,
    paddingRight: 12,
  },

  h2: {
    fontSize: 26,
    fontWeight: '900',
    color: '#50483D',
  },

  subtitle: {
    fontSize: 14,
    color: '#50483D',
    marginTop: 4,
    textAlign: ''
  },

  illustration: {
    width: 100,
    height: 120,
    alignSelf: 'flex-end',
    marginTop: -40,
  },

  moodCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 9,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  bodytext: {
    fontSize: 16,
    fontWeight: '500',
    color: '#50483D',
    textAlign: 'right'
  },

  progressSection: {
    marginTop: 24,
  },

  h3: {
    fontWeight: '600',
    fontSize: 20,
    marginBottom: 10,
    color: '#50483D'
  },

  progressCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
  },
  
  progressPercent: {
    fontSize: 24,
    fontWeight: '700',
    color: '#50483D',
  },

  progressTextRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },

  progressText: {
    fontSize: 14,
    color: 'black',
   marginLeft: 8,
  },
  
  progressBar: {
    height: 6,
    borderRadius: 4,
  },

  taskList: {
    marginTop: 20,
  },

  taskItem: {
    flexDirection: 'row',
    backgroundColor: '#F4E9DA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },

  taskItemChecked: {
    backgroundColor: '#FFD8A9',
  },

  taskTextContainer: {
    marginLeft: 12,
  },

  taskTitle: {
    fontWeight: '600',
    fontSize: 16,
    color: '#50483D'
  },

  taskSubtitle: {
    color: '#50483D',
    fontSize: 13,
  },

  
});
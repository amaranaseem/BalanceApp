import React, { useState, useEffect} from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Checkbox } from 'react-native-paper';
import * as Progress from 'react-native-progress';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';

const categoryColors = {
  'self-care': '#20C997',
  habit: '#2196F3',
  goal: '#9C27B0',
};

const HomeScreen = ({ navigation }) => {
  const [checkedTasks, setCheckedTasks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const user = getAuth().currentUser;

  {/*getting tasks from firebase */}
  useEffect(() => {
  if (!user) return;
  const unsubscribe = onSnapshot(collection(db, 'users', user.uid,'tasks'), (snapshot) => {
    const firebaseTasks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setTasks(firebaseTasks);
  });

  return unsubscribe; // Clean up on unmount
}, []);

  const toggleTask = (id) => {
    setCheckedTasks((prev) =>
      prev.includes(id) ? prev.filter((taskId) => taskId !== id) : [...prev, id]
    );
  };

const progress = tasks.length === 0 ? 0 : checkedTasks.length / tasks.length;


return (
    
  <ScrollView style={styles.container}>
  <View style={styles.topRow}>
  <View style={styles.notificationCircle}>
    <Ionicons name="notifications" size={22} color="black"/>
  </View>
        
   </View>

    {/* Welcome card */}
    <View style={styles.welcomecard}>
    <View style={styles.textContainer}>
    <Text style={styles.h2}>Welcome</Text>
    <Text style={styles.subtitle}>Let's take a mindful pause and see how you're doing today.</Text>
    </View>
    <Image source={require('../assets/meditation.jpg')} style={styles.illustration} />
    </View>

    {/* Mood Tracker Bar */}
    <View style={styles.moodBar}>
    {[
      { day: 'M', color: '#FFE38E' },   
      { day: 'T', color: '#D9D9D9' },   
      { day: 'W', color: '#90C3E6' },   
      { day: 'T', color: '#E94F4F' },    
      { day: 'F', color: '#BFD8A5' },   
      { day: 'S', color: '#B8E2DC' },   
      { day: 'S', color: '#C9B8FF' },   

     ].map((entry, index) => (
      <View key={index} style={[styles.moodCircle, { backgroundColor: entry.color }]}>
       <Text style={styles.moodLetter}>{entry.day}</Text>
      </View>
    ))}
    </View>

    {/* Mood Check-In */}
    <TouchableOpacity style={styles.moodCard} onPress={()=> navigation.navigate('MoodCheckIn')}>
    <Text style={styles.bodytext}>How are you feeling today?</Text>
    <Ionicons name="chevron-forward" size={20} color="#A58E74" />
    </TouchableOpacity>

    {/* Progress */}
    <View style={styles.progressSection}>
    <Text style={styles.h3}>Your Progress</Text>
     <View style={styles.progressCard}>
      <View style={styles.progressTextRow}>
       <Text style={styles.h2}>{Math.round(progress * 100)}%</Text>
       <Text style={styles.progressText}>of today's plan completed</Text>
       </View>
     <Progress.Bar
      progress={progress}
      color="#FFA177"
      unfilledColor="#D9D9D9"
      borderWidth={0}
      width={null}
      height={10}
      style={{ borderRadius: 10 }}
     />

    {/* Task Legend*/}
    <View style={styles.legendRow}>
      {Object.entries(categoryColors).map(([key, color]) => (
    <View key={key} style={styles.legendItem}>
    <View style={[styles.legendDot, { backgroundColor: color }]} />
    <Text style={styles.legendText}>
    {key.charAt(0).toUpperCase() + key.slice(1)} 
    </Text>
    </View>
    ))}
    </View>
    </View>
    </View>

    {/* Task List */}
    <View style={styles.taskList}>
    {tasks.map((task) => {
    const isChecked = checkedTasks.includes(task.id);
     const borderColor = categoryColors[task.category];

  return (
    <TouchableOpacity
      key={task.id}
      style={[styles.taskItem, { borderColor }]}
      onPress={() => toggleTask(task.id)}
    >
    <Checkbox
    status={isChecked ? 'checked' : 'unchecked'}
    onPress={() => toggleTask(task.id)}
    color={borderColor}
    />
    <View style={styles.taskTextContainer}>
    <Text style={styles.taskTitle}>{task.title}</Text>
    </View>
    </TouchableOpacity>
    );
    })}
    <View style={{ height: 100 }} />
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

  notificationCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D8CAB8', 
    opacity: 0.8,
  },

  welcomecard: {
    backgroundColor: '#FFE2D0',
    padding: 20,
    borderRadius: 20,
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  textContainer: {
    flex: 1,
    paddingRight: 12,
  },

  h2: {
    fontSize: 26,
    fontWeight: '900',
    color: 'black',
  },

  subtitle: {
    fontSize: 14,
    color: 'black',
    marginTop: 4,
  },

  illustration: {
    width: 100,
    height: 100,
    alignSelf: 'flex-end',
    marginTop: -40,
  },

  moodBar:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 8,
    borderColor: '#D8CAB8', 
    borderRadius: 16, 
    borderWidth: 1,
    height: 55,
    backgroundColor:'#fff'
  },

  moodCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D9D9D9', 
    opacity: 0.9,
  },

moodLetter: {
  fontWeight: '800',
  color: 'black',
  fontSize: 16,
  
},

  moodCard: {
    backgroundColor: '#F4E9DA',
    padding: 16,
    borderRadius: 9,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60,
  },

  bodytext: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'right',
  },

  progressSection: {
    marginTop: 24,
  },

  h3: {
    fontWeight: '600',
    fontSize: 20,
    marginBottom: 10,
    color: 'black',
  },

  progressCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
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

  taskList: {
    marginTop: 20,
  },

  taskItem: {
    flexDirection: 'row',
    backgroundColor: '#FAF9F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
  },

  taskTextContainer: {
    marginLeft: 12,
  },

  taskTitle: {
    fontWeight: '600',
    fontSize: 16,
    color: '#00',
  },


  legendRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 16,
  flexWrap: 'wrap',
},

legendItem: {
  flexDirection: 'row',
  alignItems: 'center',
  marginRight: 12,
  marginBottom: 8,
},

legendDot: {
  width: 10,
  height: 10,
  borderRadius: 5,
  marginRight: 6,
},

legendText: {
  fontSize: 12,
  color: 'black',
},

});

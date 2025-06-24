import React, { useState} from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Checkbox } from 'react-native-paper';
import * as Progress from 'react-native-progress';


const tasks = [
  { id: 1, title: 'Digital Detox', description: 'take a 15min break from your screen', category: 'self-care' },
  { id: 2, title: 'Journal', description: 'write 3 things you’re grateful for', category: 'self-care' },
  { id: 3, title: 'Morning Mindfulness', description: '5 min of deep breathing', category: 'self-care' },
  { id: 4, title: 'Sleep by 10', description: '1/30', category: 'habit' },
  { id: 5, title: 'Short walk', description: 'take a 10min walk outside', category: 'goal' },
  { id: 6, title: 'Read a Book', description: 'read for 10 minutes', category: 'goal' },
];

const categoryColors = {
  'self-care': '#20C997',
  habit: '#2196F3',
  goal: '#9C27B0',
};

const HomeScreen = ({ navigation }) => {
  const [checkedTasks, setCheckedTasks] = useState([]);

  const toggleTask = (id) => {
    setCheckedTasks((prev) =>
      prev.includes(id) ? prev.filter((taskId) => taskId !== id) : [...prev, id]
    );
  };

  const progress = checkedTasks.length / tasks.length;

  const categoryCounts = tasks.reduce((acc, task) => {
    const isChecked = checkedTasks.includes(task.id);
    if (!acc[task.category]) acc[task.category] = { total: 0, done: 0 };
    acc[task.category].total += 1;
    if (isChecked) acc[task.category].done += 1;
    return acc;
  }, {});


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
          { day: 'M', color: '#FFE38E' },   // joy
          { day: 'T', color: '#D9D9D9' },   // no check-in
          { day: 'W', color: '#90C3E6' },   // sad
          { day: 'T', color: '#E94F4F' },   // angry 
          { day: 'F', color: '#BFD8A5' },   // disgust
          { day: 'S', color: '#B8E2DC' },   // calm
          { day: 'S', color: '#C9B8FF' },   // fear
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
            unfilledColor="#F4E4D6"
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
                  {key.charAt(0).toUpperCase() + key.slice(1)} (
                  {categoryCounts[key]?.done || 0}/{categoryCounts[key]?.total || 0})
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
                <Text style={styles.taskSubtitle}>{task.description}</Text>
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
    borderRadius: 16,
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
    width: 110,
    height: 115,
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

  taskSubtitle: {
    color: 'black',
    fontSize: 13,
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

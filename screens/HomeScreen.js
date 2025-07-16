import React, { useState, useEffect} from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, snapshot } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Checkbox } from 'react-native-paper';
import * as Progress from 'react-native-progress';
import { collection, onSnapshot, updateDoc, doc, getDoc} from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';
import { startOfWeek, endOfWeek, isSameDay } from 'date-fns';


const categoryColors = {
  'self-care': '#20C997',
  habit: '#2196F3',
  goal: '#9C27B0',
};

const moods = [
  {label: 'joy', color: '#FFE38E'},
  {label: 'sad', color: '#90C3E6' },
  {label: 'angry', color: '#E94F4F'},
  {label: 'anxiety', color: '#C9B8FF' },
  {label: 'calm', color: '#B8E2DC'},
  {label: 'neutral', color: '#B7A282'},
];

const HomeScreen = ({ navigation }) => {
  const [checkedTasks, setCheckedTasks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const user = getAuth().currentUser;
  const [moodStreak, setMoodStreak] = useState(0);
  const [moodCheckIns, setMoodCheckIns] = useState([]);

  const [userProfile, setUserProfile] = useState(null);


{/*Fetch user profile*/}
useEffect(() => {
  const fetchUserProfile = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setUserProfile(userSnap.data());
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  fetchUserProfile();
}, []);

 {/*Fetch mood streak*/}
  useEffect(() => {
  if (!user) return;
  const unsubscribe = onSnapshot(
    collection(db, 'users', user.uid, 'moodCheckins'),
    (snapshot) => {
      const today = new Date();
      const datesSet = new Set();

      snapshot.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate?.() || new Date(data.createdAt);
        const dateStr = createdAt.toDateString(); 
        datesSet.add(dateStr);
      });

      let streak = 0;
      for (let i = 0; i < 30; i++) {
        const day = new Date(today);
        day.setDate(today.getDate() - i);
        const key = day.toDateString();
        if (datesSet.has(key)) {
          streak++;
        } else {
          break;
        }
      }
      setMoodStreak(streak);
    }
  );

  return unsubscribe;
}, []);

{/*Mood bar */}
useEffect(() => {
  if (!user) return;

  const unsubscribe = onSnapshot(
    collection(db, 'users', user.uid, 'moodCheckins'),
    (snapshot) => {
      const start = startOfWeek(new Date(), { weekStartsOn: 1 });
      const end = endOfWeek(new Date(), { weekStartsOn: 1 });

      const weekCheckIns = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((entry) => {
          const date = entry.createdAt?.toDate?.();
          return date && date >= start && date <= end;
        });

      setMoodCheckIns(weekCheckIns);
    }
  );

  return unsubscribe;
}, []);

{/*Mood bar calendar */}
const getWeekMoodData = () => {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });

  return Array.from({ length: 7 }).map((_, i) => {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);

    const checkIn = moodCheckIns.find((entry) => {
      const date = entry.createdAt?.toDate?.();
      return date && isSameDay(date, currentDate);
    });

    const color = checkIn
      ? moods.find((m) => m.label === checkIn.mood)?.color
      : null;

    return {
      day: currentDate.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
      logged: !!checkIn,
      color,
    };
  });
};

{/*getting tasks from firebase */}
useEffect(() => {
  if (!user) return;
  const unsubscribe = onSnapshot(collection(db, 'users', user.uid,'tasks'), (snapshot) => {
    const firebaseTasks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .filter(
      (task) => task.trackNow === true &&
      (task.category === 'habit' || task.category === 'goal' || task.category === 'self-care')

    );

    setTasks(firebaseTasks);
  });

  return unsubscribe; 
}, []);

  const toggleTask = async (id) => {
    const task= tasks.find((t) => t.id === id);
    const isChecked = checkedTasks.includes(id);
    
    if (!task) return;

      setCheckedTasks((prev) =>
      prev.includes(id) ? prev.filter((taskId) => taskId !== id) : [...prev, id]
    );
  
    
 //update goal progress
  if (task.category === 'goal') {
    const taskRef = doc(db, 'users', user.uid, 'tasks', id);
    const currentProgress = task.progress || 0;

    try {
      await updateDoc(taskRef, {
        progress: isChecked
          ? Math.max(currentProgress - 1, 0)
          : currentProgress + 1,
      });
    } catch (err) {
      console.error('Failed to update goal progress:', err);
    }
  }
};
{/* prgoress bar for tasks */}
const progress = tasks.length === 0 ? 0 : checkedTasks.length / tasks.length;


return (
  <ScrollView style={styles.container}>
  <View style={styles.topRow}>

  {/* Profile */}
  <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')}>
  <Image   source={
  userProfile?.profileImage
  ? { uri: userProfile.profileImage }
  : require('../assets/profilepic.png')
  }
  style={styles.profilePic}
  />
  </TouchableOpacity>

  {/* Mood Streak */}
  <View style={styles.streak}>
  <Ionicons name="flame" size={20} color="gold" />
  <Text style={styles.streakText}>{moodStreak}-Day Mood Streak</Text>
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
  {getWeekMoodData().map((entry, index) => (
  <View
  key={index}
  style={[
  styles.moodCircle,
  {
    backgroundColor: entry.logged ? entry.color : '#D9D9D9',
    opacity: entry.logged ? 1 : 0.4,
  },
  ]}
  >
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
  paddingTop: 60,
},

topRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 20,
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

profilePic: {
  width: 50,
  height: 50,
  borderRadius: 200,
  borderColor: '#000',
},

streak: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#fff',
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 20,
},

streakText: {
  color: 'black',
  fontWeight: 'bold',
  marginLeft: 6,
  fontSize: 14,
},

});


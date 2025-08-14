import React, { useState, useEffect} from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Checkbox } from 'react-native-paper';
import * as Progress from 'react-native-progress';
import { collection, onSnapshot, updateDoc, doc, getDoc} from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';
import { startOfWeek, endOfWeek, isSameDay, getWeek } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';

const categoryColors = { 'self-care': '#20C997', habit: '#2196F3', goal: '#9C27B0', };
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
  const [moodStreak, setMoodStreak] = useState(0);
  const [weekMoodData, setWeekMoodData] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const user = getAuth().currentUser;

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
    //listen in real-time for mood checkins
    const unsubscribe = onSnapshot(collection(db, 'users', user.uid, 'moodCheckins'),
      (snapshot) => {
        const today = new Date();
        const datesSet = new Set();

      //store all check-in dates
      snapshot.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate?.() || new Date(data.createdAt);
        datesSet.add(createdAt.toDateString());
      });

      let streak = 0;
      let currentDate = new Date(today);
      
      //check streak from yesterday
      while (datesSet.has(currentDate.toDateString())) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      }
      setMoodStreak(streak);
    }
  );

    return unsubscribe;
  }, []);

  {/*Mood Tracker Bar */}
  useEffect(() => {
  if (!user) return;
  
  //Listen for moodcheckin in real-time
  const unsubscribe = onSnapshot( collection(db, 'users', user.uid, 'moodCheckins'),
   (snapshot) => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 }); //Monday
    const end = endOfWeek(new Date(), { weekStartsOn: 1 }); //Sunday

    //Filtering data to get only check-ins for presentt week
    const weekCheckIns = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(entry => {
        const date = entry.createdAt?.toDate?.();
        return date && date >= start && date <= end;
    });

    //creating weekly data  
    const weekData = Array.from({ length: 7 }).map((_, i) => {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
        
    //checking mood checkin on the current date
    const checkIn = weekCheckIns.find(entry => {
      const date = entry.createdAt?.toDate?.();
      return date && isSameDay(date, currentDate);
    });

    return {
      day: currentDate.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
      logged: !!checkIn,
      color: checkIn
       ? moods.find(m => m.label === checkIn.mood)?.color
       : null,
      };
    });

    setWeekMoodData(weekData);
  }
 );

  return unsubscribe;
}, [user]);

  {/*getting tasks from firebase that have "True" for trackNow */}
  useEffect(() => {
    if (!user) return;
    //listens if new tasks is added in the tasks collection
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

  // load the tasks from local storage
  useEffect(()=> {
    const loadTasks =async () => {
    const today = new Date().toDateString();
    const saved = await AsyncStorage.getItem('checkedTasksDaily'); 
    const parsed = saved ? JSON.parse(saved): null;

    //if current date data is preseent restore it to be displayed 
    if(parsed?.date === today) {
      setCheckedTasks(parsed.tasks);
    }
    //if no data reset checked tasks and store an empty list 
    else{
      setCheckedTasks([]);
      await AsyncStorage.setItem('checkedTasksDaily', JSON.stringify ({date: today, tasks: [] }));
    }
  };
    loadTasks();
  }, []);

  //stores the data locally so users dont have to remark the tasks everytime they open the app
  const updatedCheckedTasks = async (newTasks) => {
    const today = new Date().toDateString();
    setCheckedTasks(newTasks);
    await AsyncStorage.setItem('checkedTasksDaily', JSON.stringify ({date: today, tasks: newTasks })); //save updated list locally
  }

  {/*Toggle Task Function */}
  const toggleTask = async (id) => {
    const task = tasks.find((t) => t.id === id); //find task id
    const isChecked = checkedTasks.includes(id); //checks its status
      
    if (!task) return;
    const updatedChecked = isChecked ? checkedTasks.filter((t) => t !== id) : [...checkedTasks, id];
    await updatedCheckedTasks(updatedChecked); //saving 
      
    if(updatedChecked.length === tasks.length && tasks.length > 0 ){
      Alert.alert ('🎉Great Job!', 'All tasks completed for today.');
    }
      
  //update goal progress in Firebase 
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

  // Keep only checked task IDs that still exist in the current task list
  const validCheckedTasks = checkedTasks.filter((id) =>
    tasks.find((task) => task.id === id)
  );

  // Calculate progress based on valid tasks only
  const progress = tasks.length === 0 ? 0 : validCheckedTasks.length / tasks.length;


return (
  <ScrollView style={styles.container}>
  <View style={styles.topRow}>

  {/* Profile */}
  <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')}>
    <Image   
    source={ userProfile?.profileImage ? { uri: userProfile.profileImage} : require('../assets/profilepic.png')}
    style={styles.profilePic}
    />
  </TouchableOpacity>

  {/* Mood Streak */}
  <View style={styles.streak}>
    <Ionicons name="flame" size={20} color="gold" />
    <Text style={styles.streakText}>{moodStreak}-Day Streak</Text>
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
    {weekMoodData.map((entry, index) => (
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
  backgroundColor: '#fff',
  paddingHorizontal: 20,
  paddingTop: 60,
},

topRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 20,
  alignItems: 'center',
},

welcomecard: {
  backgroundColor: '#FFE2D0',
  padding: 20,
  borderRadius: 10,
  marginTop: 30,
  flexDirection: 'row',
  justifyContent: 'space-between',
  borderWidth: 1,
  borderColor: '#FFE2D0',
  elevation: 2
},

textContainer: {
  flex: 1,
  paddingRight: 12,
},

h2: {
  fontSize: 26,
  fontWeight: '900',
  color: 'black',
  fontStyle: 'italic', 
  color: '#50483D'
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
  backgroundColor: '#FAEDDD',
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
  borderColor: '#FFA177', 
  borderWidth: 1,
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
  backgroundColor: 'transparent',
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
  borderWidth: 0.5,
},

streak: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#fff',
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 20,
  borderWidth: 0.5,
},

streakText: {
  color: 'black',
  fontWeight: 'bold',
  marginLeft: 6,
  fontSize: 14,
},

});


import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import AddTaskScreen from './AddTaskScreen';
import { doc, deleteDoc} from 'firebase/firestore';
import { Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';

const categoryColors = { 'self-care': '#20C997', habit: '#2196F3', goal: '#9C27B0', };

// delete task
const deleteTask = async (id) => {
  try {
    const user = getAuth().currentUser;
    const taskRef = doc(db, 'users', user.uid, 'tasks', id)
    await deleteDoc(taskRef);
  } catch (error) {
  console.error('Error deleting task:', error);
  }
};

// confirm delete task
const confirmDelete = (id) => {
  Alert.alert(
    '❌ Delete Task',
    'Are you sure you want to delete this task?',
  [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: () => deleteTask(id) },
  ]
 );
};

const HabitandGoalScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [tasks, setTasks] = useState([]);
  const user = getAuth().currentUser;
  const [shownGoalAlerts, setShownGoalAlerts] = useState([]);

// get tasks from Firebase
useEffect(() => {
  if (!user) return;
  const taskRef = collection(db, 'users', user.uid, 'tasks');

  const unsubscribe = onSnapshot(taskRef, (snapshot) => {
  const firebaseTasks = snapshot.docs.map((doc) => ({
    id: doc.id,
    title: doc.data().title,
    category: doc.data().category,
    progress: doc.data().progress,
    target: doc.data().target,
   }));

    setTasks(firebaseTasks); 
  });

    return () => unsubscribe();
  }, []);


return (
  <View style={styles.container}>
  
  {/* Header */}
  <View style={styles.topRow}>
  <Text style={styles.headerText}>My Tasks</Text>
  </View>

  {/* Task List */}
  <ScrollView style={styles.taskList}>

  {/* self-care tasks & habits */}
  <Text style={styles.sectionHeader}>Habits & Self-care Tasks</Text>
  {tasks.filter(task => task.category === 'habit' || task.category === 'self-care'). length === 0 ? (
  <Text style={styles.placeholder}> No tasks added yet.</Text>
    ) : (
    tasks
    .filter(task => task.category === 'habit' || task.category === 'self-care')
    .map((task) => {
    const borderColor = categoryColors[task.category];
          
return (
  <TouchableOpacity key={task.id} style={[styles.taskItem, { borderColor }]}>
  <View style={styles.taskTextContainer}>
  <Text style={styles.taskTitle}>{task.title}</Text>
  </View>

  {/* delete btn*/}
  <TouchableOpacity onPress={() => confirmDelete(task.id)} style={{ marginLeft: 'auto' }} >
  <Ionicons name="trash" size={20} color="#E94F4F" />
  </TouchableOpacity>
  </TouchableOpacity>
   );
  })
)}

{/*goals */}     
<Text style={styles.sectionHeader}>Goals</Text>
{tasks.filter(task => task.category === 'goal'). length === 0 ? (
<Text style={styles.placeholder}> No goal added yet.</Text>
) : (
  tasks
  .filter(task => task.category === 'goal')
  .map((task) => {
       
  const progress = task.progress || 0;
  const target =  30;
  const progressPercent = Math.min(progress / target, 1);
  if (progress >= target && !shownGoalAlerts.includes(task.id)) {
  Alert.alert('🎉 Goal Complete', `You completed: ${task.title}`);
  setShownGoalAlerts(prev => [...prev, task.id]);
}

return (
  <View key={task.id} style={[styles.goalCard, { borderColor: categoryColors.goal }]}>
  <Text style={styles.goalTitle}>{task.title}</Text>
  <View style={styles.progressBarBackground}>
    <View style={[styles.progressBarFill, { width: `${progressPercent * 100}%` }, ]}/>
  </View>
  
  <Text style={styles.goalCount}>{progress}/{target}</Text>
  <TouchableOpacity onPress={() => confirmDelete(task.id)} style={styles.goalDelete}>
    <Ionicons name="trash" size={18} color="#E94F4F" />
  </TouchableOpacity>
  </View>
    );
  })
)} 
</ScrollView>

{/* Add Tasks Button */}
 <TouchableOpacity style={styles.saveBtn} onPress={() => setModalVisible(true)}>
  <Text style={styles.saveText}>+ Add</Text>
 </TouchableOpacity>
   
{/* Modal */}
<Modal visible={modalVisible} animationType="fade" transparent>
  <View style={styles.modalBackground}>
  <View style={styles.modalContainer}>
  <AddTaskScreen closeModal={() => setModalVisible(false)} />
  </View>
  </View>
</Modal>
</View>
 );
};

export default HabitandGoalScreen;

const styles = StyleSheet.create({
container: {
  flex: 1,
  paddingHorizontal: 20,
  paddingVertical: 20,
  backgroundColor: '#FAF9F6',
  paddingTop: 60,
},

topRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  marginBottom: 10,
},

headerText: {
  fontSize: 26,
  fontWeight: 'bold',
  color: '#50483D',
},

taskList: {
  marginTop: 20,
  flexGrow: 1,
},

taskItem: {
  flexDirection: 'row',
  padding: 16,
  borderRadius: 16,
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
  color: 'black',
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

saveBtn: {
  marginTop: 20,
  backgroundColor: '#A8D5BA',
  padding: 14,
  borderRadius: 15,
  alignItems: 'center',
},

saveText: {
  fontWeight: 'bold',
  color: 'black',
},

modalBackground: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},

modalContainer: {
  width: '90%',
  backgroundColor: '#fff',
  borderRadius: 20,
  padding: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
}, 

placeholder:{
 justifyContent: 'center', 
 textAlign: 'center', 
 marginTop: 100, 
 color: '#777', 
 fontSize: 17,
},

goalCard: {
  borderWidth: 2,
  borderRadius: 16,
  padding: 16,
  marginBottom: 12,
  position: 'relative',
},

goalTitle: {
  fontWeight: '600',
  fontSize: 16,
  color: 'black',
  marginBottom: 8,
},

progressBarBackground: {
  height: 8,
  borderRadius: 4,
  backgroundColor: '#ddd',
  overflow: 'hidden',
},

progressBarFill: {
  height: 8,
  borderRadius: 4,
  backgroundColor: '#9C27B0',
},

goalCount: {
  marginTop: 8,
  textAlign: 'right',
  fontWeight: 'bold',
  color: '#333',
},

goalDelete: {
  position: 'absolute',
  top: 12,
  right: 12,
},

sectionHeader: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 20,
  marginTop: 10,
  color: '#50483D',
},


});


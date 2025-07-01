import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Checkbox } from 'react-native-paper';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import AddTaskScreen from './AddTaskScreen';
import { doc, deleteDoc } from 'firebase/firestore';
import { Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const categoryColors = {
  'self-care': '#20C997',
  habit: '#2196F3',
  goal: '#9C27B0',
};

// delete task
const deleteTask = async (id) => {
  try {
    await deleteDoc(doc(db, 'tasks', id));
  } catch (error) {
    console.error('Error deleting task:', error);
  }
};

// confirm delete task
const confirmDelete = (id) => {
  Alert.alert(
    'Delete Task',
    'Are you sure you want to delete this task?',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTask(id) },
    ]
  );
};


const HabitandGoalScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const [checkedTasks, setCheckedTasks] = useState([]);
  const [tasks, setTasks] = useState([]);

  // get tasks from Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      const firebaseTasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title,
        category: doc.data().category,
      }));

      setTasks(firebaseTasks); 
    });

    return () => unsubscribe();
  }, []);

  // checking the tasks
  const toggleTask = (id) => {
    setCheckedTasks((prev) =>
      prev.includes(id) ? prev.filter((taskId) => taskId !== id) : [...prev, id]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topRow}>
        <Text style={styles.headerText}>Habits & Goals</Text>
      </View>

      {/* Category Legend */}
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

      {/* Task List */}
      <ScrollView style={styles.taskList}>
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

       {/* delete btn*/}
      <TouchableOpacity
        onPress={() => confirmDelete(task.id)}
        style={{ marginLeft: 'auto' }}
      >
      <Ionicons name="trash" size={20} color="#E94F4F" />
      </TouchableOpacity>
      </TouchableOpacity>
      );
    })}
    </ScrollView>

      {/* Add Button */}
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
    marginTop: 40,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FAF9F6',
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
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

});

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Switch} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';

const categoryColors = {
  'self-care': '#20C997',
  habit: '#2196F3',
  goal: '#9C27B0',
};

const AddTaskScreen = ({ closeModal }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');

  const [trackNow, setTrackNow] = useState(false);
  const [target, setTarget] = useState('');
  const [saveError, setSaveError] = useState('');

const saveTask = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  setSaveError('');


  if (!user) 
  return;

  if (!title.trim() || !category) {
   setSaveError('Please write tasks name and select category.');
   console.log('Field cannot be empty.')
  return;
  }

  try {
   await addDoc(collection(db, 'users', user.uid, 'tasks'), {
   title: title.trim(),
   category,
   createdAt: new Date(),
   userId: user.uid,
   trackNow,
   completedCount: 0,
   target: category === 'goal' ? 30 : 1,
   progress: category === 'goal' ? 0: null,
  });

  Alert.alert('Success', 'Task added successfully!');
  console.log ('Task added');
  setTitle('');
  setCategory('');
  setTarget('');
  setTrackNow(false);
  closeModal();

  } catch (err) {
    console.error('Failed to save:', err);
    Alert.alert('Error', 'Something went wrong.');
  }
};

return (
  <View style={styles.container}>
  {/* Header */}
  <View style={styles.header}>
  <TouchableOpacity onPress={closeModal}>
   <Ionicons name="close" size={24} color="black" />
  </TouchableOpacity>
  <Text style={styles.title}>Add Task</Text>
  </View>

  {/* Input */}
  <TextInput
  placeholder="Enter task title"
  value={title}
  onChangeText={setTitle}
  style={styles.input}
  />

  {/* Category */}
  <Text style={styles.subheading}>Choose a category</Text>
  <View style={styles.tagContainer}>
  {Object.keys(categoryColors).map((cat) => (
  <TouchableOpacity
  key={cat}
  style={[styles.tag, category === cat && { backgroundColor: categoryColors[cat] }, 
  ]}
  onPress={() => setCategory(cat)}
  >
  <Text
  style={[ styles.tagText, category === cat && { color: '#fff', fontWeight: 'bold' },
  ]}>
  {cat}
  </Text>
  </TouchableOpacity>
  
  ))}
  </View>
  
  {/* Target input for goals */}
  {category === 'goal'}

  {/* Track Now */}
  <View style={styles.trackRow}>
  <Text style={styles.subheading}>Track Now</Text>
  <Switch
    value={trackNow}
    onValueChange={setTrackNow}
    thumbColor={trackNow ? '#3C4F46' : '#ccc'}
  />
  <TouchableOpacity onPress={() => 
    Alert.alert("Track Task", "You can select this option to view the task on your home screen and track it.")}>
    <Ionicons name="information-circle-outline" size={20} color="#3C4F46" />
  </TouchableOpacity>
  </View>

  {/* Save */}
  <TouchableOpacity style={styles.saveBtn} onPress={saveTask}>
    <Text style={styles.saveText}>Save</Text>
  </TouchableOpacity>
 
  </View>
  );
};

export default AddTaskScreen;

const styles = StyleSheet.create({
container: { 
  padding: 10, 
  backgroundColor: '#fff',
},
  
header: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
  marginBottom: 20,
},
  
title: { 
  fontSize: 20, 
  fontWeight: 'bold' 
},
  
input: {
  borderWidth: 1, 
  borderColor: '#ccc', 
  padding: 12, 
  borderRadius: 8, 
  marginBottom: 20,
},
  
subheading: { 
  fontSize: 16, 
  marginBottom: 10 
},
  
tagContainer: { 
  flexDirection: 'row', 
  gap: 10, 
  marginBottom: 30 
},
  
tag: {
  borderWidth: 1, 
  borderColor: '#ccc', 
  borderRadius: 20, 
  paddingHorizontal: 15, 
  paddingVertical: 8,
},

tagText: { 
  color: '#000' 
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

trackRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 10,
},

fixedTargetText: {
  fontSize: 16,
  marginBottom: 10,
  fontWeight: 'bold',
  color: '#333',
},

});


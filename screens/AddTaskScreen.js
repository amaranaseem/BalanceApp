import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert} from 'react-native';
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

  const saveTask = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      Alert.alert('Authentication Error', 'You must be logged in to add a task.');
    return;
    }

    if (!title.trim() || !category) return;

    try {
      await addDoc(collection(db, 'users', user.uid, 'tasks'), {
        title: title.trim(),
        category,
        createdAt: new Date(),
        userId: user.uid,
      });

      Alert.alert('Success', 'Task added successfully!');
      console.log ('Task added');
      setTitle('');
      setCategory('');
      closeModal(); // close popup  

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
            style={[
              styles.tag,
              category === cat && { backgroundColor: categoryColors[cat] },
            ]}
            onPress={() => setCategory(cat)}
          >
            <Text
              style={[
                styles.tagText,
                category === cat && { color: '#fff', fontWeight: 'bold' },
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
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
    backgroundColor: '#fff' 
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
});

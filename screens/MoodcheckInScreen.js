import { StyleSheet, Text, View, TouchableOpacity, ScrollView, KeyboardAvoidingView, TextInput, Alert } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';  
import app from '../firebase'
import { getAuth } from 'firebase/auth';


const db = getFirestore(app);

const moods = [
  { emoji: '😁', label: 'joy', color: '#FFE38E', score: 1 },
  { emoji: '😞', label: 'sad', color: '#90C3E6', score: 2 },
  { emoji: '😡', label: 'angry', color: '#E94F4F', score: 3 },
  { emoji: '😨', label: 'anxiety', color: '#C9B8FF', score: 4 },
  { emoji: '😌', label: 'calm', color: '#B8E2DC', score: 5 },
  { emoji: '😐', label: 'neutral', color: '#B7A282', score: 6 },
];

const defaultTags = [
  'work', 'family', 'health', 'no sleep', 'social media', 'friends', 'relaxed', 'love', 'tired', 'fear','bored'
];

{/*Mood checkin */}
const MoodCheckInScreen = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [note, setNote] = useState('');
  const [tagError, setTagError ] = useState('');
  const [saveError, setSaveError ] = useState('');
  const navigation = useNavigation();

{/*Mood checkin */}
const today = new Date().toLocaleDateString('en-GB', {
  day: 'numeric', month: 'long', year: 'numeric'
});

{/*Tags fxn */}
const handleTagPress = (tag) => {
  setTagError('');
    if (selectedTags.includes(tag)) {
      setSelectedTags((prev) => prev.filter((t) => t !== tag));

  } else if (selectedTags.length < 3) {
      setSelectedTags((prev) => [...prev, tag]);

  } else {
    setTagError('You can select up to 3 tags only.');
    
    setTimeout(() => setTagError(''), 3000);
  }
};


{/*save btn fxn */}
const handleSave = async() => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    Alert.alert('Authentication Error', 'You must be logged in to check-in mood.');
    return;
  }
  setSaveError('');

  if (!selectedMood) {
    setSaveError('Please select a mood before saving.');
    setTimeout(() => setSaveError(''), 3000);
    return;
  }

 // mood check-in saved on firebase
  try {
  await addDoc(collection(db,'users', user.uid, 'moodCheckins'), {
    mood: selectedMood.label,
    moodColor: selectedMood.color,
    tags: selectedTags,
    notes: note,
    createdAt: serverTimestamp(),
    userId: user.uid, 
    score: selectedMood.score,
  });

  Alert.alert("Well done!", "You've successfully logged your mood.", [
  { text: "OK", onPress: () => navigation.navigate('HomeTabs'), }
  ]);
  
} catch (error) {
    console.error("Error saving mood check-in:", error);
    setSaveError('Something went wrong. Try again.');
}
};

return (
 <KeyboardAvoidingView style={{ flex: 1 }} behavior='padding'>
  <ScrollView contentContainerStyle={styles.container}>
      
  {/* Header */}
  <View style={styles.topRow}>
    <Text style={styles.headerText}>Mood Check-In</Text>
      <View style={styles.closeCircle}>
        <TouchableOpacity onPress={()=> navigation.navigate('HomeTabs')}>
          <Ionicons name="close" size={22} color="black" />
        </TouchableOpacity>
    </View>
  </View>

  {/* Date */}
  <View style={styles.dateRow}>
  <Ionicons name="calendar-outline" size={20} color="#A58E74" />
  <Text style={styles.dateText}>{today}</Text>
  </View>

  {/* Mood Selection */}
  <Text style={styles.heading}>How are you feeling?</Text>
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodScroll}>
  {moods.map((mood, index) => (
  <TouchableOpacity
  key={index}
  style={[styles.moodItem, selectedMood?.label === mood.label && { backgroundColor: mood.color }]}
  onPress={() => setSelectedMood(mood)}>
  <Text style={styles.emoji}>{mood.emoji}</Text>
  <Text style={styles.moodLabel}>{mood.label}</Text>
  </TouchableOpacity>
  ))}
  </ScrollView>

  {/* Error on save */}
  {saveError !== '' && <Text style={styles.errorText}>{saveError}</Text>}

  {/* Tags */}
  <Text style={styles.heading}>What makes you feel this way?</Text>
  <View style={styles.tagcontainer}>
  
  {defaultTags.map((tag, i) => (
  <TouchableOpacity key={i} style={[ styles.tag, selectedTags.includes(tag) && styles.selectedTag, ]}
  onPress={() => handleTagPress(tag)} >
  
  <Text style={[styles.tagText, selectedTags.includes(tag) && styles.selectedTagText]}>{tag}</Text>
  </TouchableOpacity>
  ))}
  </View>

  {/* Error on tags */}
  {tagError !== '' && <Text style={styles.errorText}>{tagError}</Text>}

        
  {/* Note Input */}
  <Text style={styles.heading}>Want to jot down what’s on your mind?</Text>
  <TextInput
  style={styles.input}
  placeholder="Write about your day..."
  multiline
  maxLength={30}
  value={note}
  onChangeText={setNote}
  />
  <Text style={styles.counter}>({note.length}/30)</Text>


  {/* Save Button */}
  <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
  <Text style={styles.saveText}>Save</Text>
  </TouchableOpacity>

  </ScrollView>
  </KeyboardAvoidingView>
  );
};

export default MoodCheckInScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
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

  closeCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D8CAB8',
    opacity: 0.8,
  },

  headerText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#50483D',
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#DDD2C1',
    borderWidth: 1,
    padding: 10,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 20,
    width: '100%',
    justifyContent: 'center',
  },

  dateText: {
    marginLeft: 8,
    color: 'black',
    fontWeight: '600',
  },

  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#50483D',
    marginTop: 16,
    marginBottom: 10,
  },

  moodScroll: {
    maxHeight: 100,
    marginBottom: 10,
  },

  moodItem: {
    backgroundColor: '#F0ECE6',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginRight: 10,
    alignItems: 'center',
    width: 85,
    height: 90,
  },

  emoji: {
    fontSize: 24,
  },

  moodLabel: {
    fontSize: 12,
    marginTop: 9,
    fontWeight: 'bold',
    color: 'black',
    textTransform: 'capitalize',
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

  tagcontainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  tag: {
    backgroundColor: '#F0ECE6',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  selectedTag: {
    backgroundColor: '#A58E74',
  },

  selectedTagText: {
    color: '#fff',
    fontStyle: 'italic',
    fontWeight: 'bold',
  },

   input: {
    height: 100,
    backgroundColor: '#F4E9DA',
    borderRadius: 12,
    padding: 14,
    textAlignVertical: 'top',
    marginTop: 8,
    opacity:0.9,
  },

  counter: {
    textAlign: 'right',
    marginTop: 4,
    color: '#888',
    fontSize: 12,
  },

errorText: {
    color: '#E94F4F',
    marginTop: 6,
    marginBottom: 4,
    fontSize: 13,
    fontWeight: '500',
    fontStyle: 'italic',
  },
});

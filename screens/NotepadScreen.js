import { StyleSheet, Text, View, TouchableOpacity, ScrollView, KeyboardAvoidingView, TextInput, Alert } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import {  collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';


const moods = [
  { label: 'joy', color: '#FFE38E' },
  { label: 'sad', color: '#90C3E6' },
  { label: 'angry', color: '#E94F4F' },
  { label: 'anxiety', color: '#C9B8FF' },
  { label: 'calm', color: '#B8E2DC' },
  { label: 'neutral', color: '#B7A282' },
];

const NotepadScreen = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [title, setTitle] = useState('');
  const [saveError, setSaveError] = useState('');
  const navigation = useNavigation();
  const [recording, setRecording] = useState(null);
  const [audioURI, setAudioURI] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoStopTimeout, setAutoStopTimeout] = useState(null);

  {/* Timer function */}
  useEffect(() => {
    let timer;
    if (recording) {
     timer = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
   } else {
    clearInterval(timer);
   }
    return () => clearInterval(timer);
  }, [recording]);

  {/* Formatting Time */}
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  {/* Play Audio function */}
  const playRecording = async () => {
   try {
    if (!audioURI) return;

    if (sound) {
     const status = await sound.getStatusAsync();
    if (status.isPlaying) {
     await sound.pauseAsync();
     setIsPlaying(false);
    } else {
     await sound.playAsync();
     setIsPlaying(true);
    }
  return;
 }

  const { sound: newSound } = await Audio.Sound.createAsync(
  { uri: audioURI },
  { shouldPlay: true }
  );
    setSound(newSound);
    setIsPlaying(true);

  newSound.setOnPlaybackStatusUpdate(status => {
  if (status.didJustFinish || !status.isPlaying) {
  setIsPlaying(false);
   }
    });
  } catch (error) {
    console.error('Playback error:', error);
   }
  };

  {/* Start Audio function */}
  const startRecording = async () => {
   try {
    // Stop existing recording if still active
    if (recording) {
    await recording.stopAndUnloadAsync();
    setRecording(null);
    }

  const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
    alert('Permission to access microphone is required!');
     return;
    }
    setRecordingTime(0); 

  const newRecording = new Audio.Recording();
   await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
   await newRecording.startAsync();

   setRecording(newRecording);

  // Auto stop after 60 seconds
   const timeout = setTimeout(() => stopRecording(), 60000);
    setAutoStopTimeout(timeout);
  } catch (err) {
    console.error('Error starting recording', err);
   }
 };

  {/* Stop Audio function */}
  const stopRecording = async () => {
   try {
     if (!recording) return;
     await recording.stopAndUnloadAsync();
     const uri = recording.getURI();
     setAudioURI(uri);
     setRecording(null);
   } catch (err) {
     console.error('Error stopping recording', err);
   }
 };

  {/*Function to store audio on Cloundinary */}
  const uploadToCloudinary = async (audioURI) => {
  const data = new FormData();
  data.append('file', {
    uri: audioURI,
    type: 'audio/m4a',
    name: 'recording.m4a',
  });
  data.append('upload_preset', 'journal_audio');
  data.append('cloud_name', 'dstxsoomq');

  try {
    const response = await fetch('https://api.cloudinary.com/v1_1/dstxsoomq/auto/upload', {
      method: 'POST',
      body: data,
    });

    const result = await response.json();
    return result.secure_url; 
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    return null;
  }
 };

  {/* Save function */}
  const handleSave = async () => {
  setSaveError('');

  if (!selectedMood) {
    setSaveError('Please select a mood before saving.');
    console.log("No mood selected");
    setTimeout(() => setSaveError(''), 3000);
    return;
  }

  if (!note && !audioURI) {
    setSaveError('Please write or record audio before saving.');
    console.log("No entry made");
    return;
  }

  //Cloundinary for audio saving
  let audioURL = null;
    if (audioURI) {
     console.log('Uploading audio to Cloudinary...');
     audioURL = await uploadToCloudinary(audioURI);
     if (!audioURL) {
      setSaveError('Audio upload failed.');
      return;
    }
    console.log('Audio uploaded:', audioURL);
   }

  //User based 
  try {
    const user = getAuth().currentUser;
    if (!user) {
      setSaveError('User not authenticated.');
      return;
    }

  console.log("Saving entry to Firestore...");

  await addDoc(collection(db, 'users', user.uid, 'entries'), {
    userId: user.uid,
    title: title || 'Untitled',
    mood: selectedMood.label,
    moodColor: selectedMood.color,
    note: note,
    audioURL: audioURL,
    duration: recordingTime,
    createdAt: serverTimestamp(),
  });

  console.log("Entry saved to Firestore");

  Alert.alert("Saved!", "Your journal entry is saved.", [
  { text: "OK",
    onPress: () => {
    setTitle('');
    setNote('');
    setSelectedMood(null);
    navigation.navigate('BottomNavTab', { screen: 'Journal' });
      },
    },
    ]);
  } catch (error) {
    console.error("Firestore save error:", error);
    setSaveError('Failed to save. Try again.');
  }
};

  {/* Date */}
  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

return (
  <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
  <ScrollView contentContainerStyle={styles.container}>

  {/* Header */}
  <View style={styles.topRow}>
  <TextInput
    value={title}
    onChangeText={setTitle}
    placeholder="Untitled"
    placeholderTextColor="#999"
    style={styles.headerTextInput}
  />
  <TouchableOpacity style={styles.closeCircle} onPress={() => navigation.navigate('BottomNavTab', { screen: 'Journal' })} >
  <Ionicons name="close" size={22} color="black" />
  </TouchableOpacity>
  </View>
      
  {/*Date */}
  <View style={styles.dateRow}>
  <Ionicons name="calendar-outline" size={20} color="#A58E74" />
  <Text style={styles.dateText}>{today}</Text>
  </View>

  <Text style={styles.heading}>How are you feeling?</Text>
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodScroll}>
  {moods.map((mood, index) => (
  <TouchableOpacity key={index} style={[styles.moodItem, selectedMood?.label === mood.label && { backgroundColor: mood.color },]}
  onPress={() => setSelectedMood(mood)}>
  <Text style={styles.moodLabelOnly}>{mood.label}</Text>
  </TouchableOpacity>
  ))}
  </ScrollView>

 {saveError !== '' && <Text style={styles.errorText}>{saveError}</Text>}
 
  <TextInput
    style={styles.input}
    placeholder="Write about your day..."
    multiline
    value={note}
    onChangeText={setNote}
  />

  {/* Audio Preview */}
  {audioURI && (
  <View style={styles.audioContainer}>
  <View style={styles.audioBar}>
  <TouchableOpacity onPress={playRecording}>
    <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="black" />
  </TouchableOpacity>
  <View style={styles.waveform} />
  <Text style={styles.timerText}>{formatTime(recordingTime)}</Text>
  <TouchableOpacity onPress={() => setAudioURI(null)} style={{ marginLeft: 10 }}>
  <Ionicons name="trash" size={20} color="#E94F4F" />
  </TouchableOpacity>
  </View>
  </View>
  )}

  {/* Buttons */}
  <View style={styles.footerRow}>
  <View style={styles.recordingRow}>
  <TouchableOpacity
  style={styles.iconBtn}
  onPress={recording ? stopRecording : startRecording} >
   <Ionicons name={recording ? "stop" : "mic-outline"} size={24} color="black" />
  </TouchableOpacity>
  {recording && <Text style={styles.inlineTimer}>{formatTime(recordingTime)}</Text>}
  </View>
  <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
  <Text style={styles.saveText}>Save</Text>
  </TouchableOpacity>
  </View>
  </ScrollView>
  </KeyboardAvoidingView>
  
);
};

export default NotepadScreen;

const styles = StyleSheet.create({
container: {
  flexGrow: 1,
  paddingTop: 60,
  paddingHorizontal: 20,
  paddingBottom: 10,
  backgroundColor: '#fff',
},

topRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  marginBottom: 20,
},

headerTextInput: {
  fontSize: 26,
  fontWeight: 'bold',
  flex: 1,
  color: '#50483D',
},
  
closeCircle: {
  width: 38,
  height: 38,
  borderRadius: 19,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#FAEDDD',
  opacity: 0.8,
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
  marginTop: 10,
  marginBottom: 10,
},

moodScroll: {
  maxHeight: 60,
  marginBottom: 10,
},

moodItem: {
  backgroundColor: '#F0ECE6',
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderRadius: 14,
  marginRight: 10,
  justifyContent: 'center',
  alignItems: 'center',
  height: 45,
},

moodLabelOnly: {
  fontSize: 14,
  fontWeight: 'bold',
  color: '#50483D',
  textTransform: 'capitalize',
},

input: {
  height: 270,
  backgroundColor: '#fff',
  borderRadius: 12,
  borderColor: '#50483D',
  borderWidth: 1,
  padding: 14,
  textAlignVertical: 'top',
  marginTop: 8,
  opacity: 0.9,
},

errorText: {
  color: '#E94F4F',
  marginTop: 6,
  marginBottom: 4,
  fontSize: 13,
  fontWeight: '500',
  fontStyle: 'italic',
},

footerRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: 30,
},

iconBtn: {
  backgroundColor: '#FAEDDD',
  padding: 12,
  borderRadius: 50,
  width: 56,
  height: 56,
  justifyContent: 'center',
  alignItems: 'center',
},

saveBtn: {
  backgroundColor: '#A8D5BA',
  paddingVertical: 14,
  paddingHorizontal: 32,
  borderRadius: 18,
},
  
saveText: {
  fontWeight: 'bold',
  color: 'black',
  fontSize: 16,
},

recordingRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
},

inlineTimer: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#50483D',
},

audioBar: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 10,
  paddingHorizontal: 12,
  borderRadius: 30,
  backgroundColor: '#fff',
  marginBottom: 10,
  height: 55,
  borderWidth: 1,
  borderColor: '#D8CAB8',
  marginTop: 20, 
},

waveform: {
  flex: 1,
  height: 10,
  backgroundColor: '#ccc',
  borderRadius: 10,
  marginHorizontal: 10,
},

timerText: {
  color: '#000',
  fontSize: 14,
  marginRight: 6,
  fontWeight: '600',
},

audioControls: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 20,
},

});
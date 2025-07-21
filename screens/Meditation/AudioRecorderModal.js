import React, { useState, useRef, useEffect } from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { getAuth } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, getFirestore } from 'firebase/firestore';
import app from '../../firebase'; 
import { useNavigation } from '@react-navigation/native';


const db = getFirestore(app);

const AudioRecorderModal = ({ closeModal, onSave }) => {
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
  const [isUploading, setIsUploading] = useState(false);

  
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

// Function to upload audio to Cloudinary
 const uploadToCloudinary = async (audioURI) => {
   const data = new FormData();
   data.append('file', {
    uri: audioURI,
    type: 'audio/m4a',
    name: 'recording.m4a',
  });
  data.append('upload_preset', 'your_meditation_audio');
  data.append("folder", "your_meditation_audio");   //stores in specific folder

  try {
    const response = await fetch('https://api.cloudinary.com/v1_1/dstxsoomq/auto/upload', {
    method: 'POST',
    body: data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || 'Upload failed');
  }

   return result.secure_url;
} catch (error) {
  console.error('Cloudinary upload failed:', error);
    return null;
  }
};

{/* Save function */}
 const handleSave = async () => {
  if (!audioURI) {
     Alert.alert('Audio Needed','Please record audio before saving.');
    return};

  try {
    const user = getAuth().currentUser;
    if (!user) return;

    setIsUploading(true);

    const audioURL = await uploadToCloudinary(audioURI);
    if (!audioURL) throw new Error('Upload failed');

    await addDoc(collection(db, 'users', user.uid, 'userMeditations'), {
      userId: user.uid,
      audioURL,
      duration: recordingTime,
      createdAt: serverTimestamp(),
      title: title?.trim() || 'Untitled', 
    });

    Alert.alert('Success', 'Audio saved successfully!');

    // Reset state
    setAudioURI(null);
    setRecordingTime(0);

    // Refresh list and close modal
    if (onSave) onSave();
    closeModal();
  } catch (err) {
    console.error('Error saving audio:', err);
    Alert.alert('Error', 'Failed to save audio.');
  } finally {
    setIsUploading(false);
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
  
  {/* Audio Preview Bar */}
  {audioURI && (
  <View style={styles.audioPreview}>
  <TouchableOpacity onPress={playRecording}>
  <Ionicons name={isPlaying ? 'pause' : 'play'} size={24} color="black" />
  </TouchableOpacity>
  <View style={styles.waveform} />
  <Text>{formatTime(recordingTime)}</Text>
  <TouchableOpacity onPress={() => setAudioURI(null)}>
  <Ionicons name="trash" size={20} color="#E94F4F" />
  </TouchableOpacity>
  </View>
  )}
 
  {/* Buttons */}
  <View style={styles.footerRow}>
  <View style={styles.recordingRow}>
  <TouchableOpacity
  style={styles.iconBtn}
  onPress={recording ? stopRecording : startRecording}
  >
  <Ionicons name={recording ? "stop" : "mic-outline"} size={24} color="black" />
  </TouchableOpacity>
  {recording && <Text style={styles.inlineTimer}>{formatTime(recordingTime)}</Text>}
  </View>
  <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
   <Text style={styles.saveText}>Save</Text>
  </TouchableOpacity>
  </View>
  </View>
  );
};

export default AudioRecorderModal;

const styles = StyleSheet.create({
container: { 
  padding: 10, 
  backgroundColor: '#fff',
},
  
header: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
  marginBottom: 10,
},
  
title: { 
  fontSize: 20, 
  fontWeight: 'bold' 
},

input: {
  marginTop: 14,
  borderColor: '#ccc',
  borderWidth: 1,
  borderRadius: 12,
  paddingHorizontal: 12,
  height: 50,
  fontSize: 16,
  color: '#333',
},
  
audioPreview: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
  marginVertical: 20,
  marginTop: 25,
},
  
waveform: {
  flex: 1,
  height: 3,
  backgroundColor: '#ccc',
  borderRadius: 3,
},
  
row: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 20,
  gap: 12,
},
  
label: {
  fontSize: 16,
  color: '#444',
  flex: 1,
},
  
footerRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 30,
},
  
saveBtn: {
  backgroundColor: '#A8D5BA',
  paddingVertical: 14,
  paddingHorizontal: 32,
  borderRadius: 14,
},
  
saveText: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#333',
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

iconBtn: {
  backgroundColor: '#FAEDDD',
  padding: 12,
  borderRadius: 50,
  width: 56,
  height: 56,
  justifyContent: 'center',
  alignItems: 'center',
},

});

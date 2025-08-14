import React, { useState, useEffect } from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { getAuth } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, getFirestore } from 'firebase/firestore';
import app from '../../firebase'; 

const db = getFirestore(app);

const AudioRecorderModal = ({ closeModal, onSave }) => {
  const [title, setTitle] = useState('');
  const [saveError, setSaveError] = useState('');
  const [recording, setRecording] = useState(null);
  const [audioURI, setAudioURI] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  

{/* Timer function */}
 useEffect(() => {
  let timer;
  
  if (recording) {
    timer = setInterval(() => {
      setRecordingTime((prev) => prev + 1); //increases the timer once recording start
  }, 1000);
   
} else {
    clearInterval(timer);
  }
   return () => clearInterval(timer); //clears the timer
  }, 
  
  [recording]
);

{/* Converting sec into mm:ss format */}
 const formatTime = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

{/* Play Audio function */}
const playRecording = async () => {
 try {
  if (!audioURI) return; 

  // Load audio if not loaded yet
  let currentSound = sound;
  if (!currentSound) {
   const { sound: newSound } = await Audio.Sound.createAsync(
   { uri: audioURI }
  );
  
  // Listener for audio stop/finish
  newSound.setOnPlaybackStatusUpdate(status => {
  if (status.didJustFinish || !status.isPlaying) {
   setIsPlaying(false);
  }
  });
  //save loaded audio state, so no need to reload again
   setSound(newSound);
   currentSound = newSound;
  }

  // Check if audio is playing/paused
  const status = await currentSound.getStatusAsync();
   if (status.isPlaying) {
    await currentSound.pauseAsync();
    setIsPlaying(false);
  
  } else {
    await currentSound.playAsync();
    setIsPlaying(true);
  }
    
  } catch (error) {
    console.error('Playback error:', error);
  }
};

{/* Start Audio function */}
 const startRecording = async () => {
  try {

   //check if recorrder is already working or not 
   if (recording) {
    await recording.stopAndUnloadAsync();
    setRecording(null);
  }
  //permission to access microphone
  const { status } = await Audio.requestPermissionsAsync();
  if (status !== 'granted') {
      alert('Permission to access microphone is required!');
      return;
 }
  setRecordingTime(0); //reset the recorder

  //create, stores and save audio
  const newRecording = new Audio.Recording();
  await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
  await newRecording.startAsync();

  setRecording(newRecording);
  
  // Auto stop after 60 seconds
  setTimeout(async () => {
   try {
    await newRecording.stopAndUnloadAsync();
    const uri = newRecording.getURI();
    setAudioURI(uri);
    setRecording(null);
   
  } catch (err) {
      console.error('Error stopping recording:', err);
     }
   }, 60000);

  } catch (err) {
    console.error('Error starting recording', err);
  }
};

{/* Stop Audio function */}
 const stopRecording = async () => {
  try {
    if (!recording) return;

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI(); //get file path
    setAudioURI(uri); //save URI
    setRecording(null);
    
    console.log('Stopped recording at:', uri);
  
  } catch (err) {
    console.error('Error stopping recording', err);
   }
};

// Function to upload audio to Cloudinary
 const uploadToCloudinary = async (audioURI) => {
   const data = new FormData(); 
   //metadata of the audio for storing  
   data.append('file', {
    uri: audioURI,
    type: 'audio/m4a',
    name: 'recording.m4a',
  });
  
  data.append('upload_preset', 'your_meditation_audio'); 
  data.append("folder", "your_meditation_audio");   //stores in specific folder

  //requesting cloudiary to upload the audio
  try {
    const response = await fetch('https://api.cloudinary.com/v1_1/dstxsoomq/auto/upload', {
    method: 'POST',
    body: data,  
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const result = await response.json(); //stores cloudinary sent data 
   return result.secure_url;

  } catch (error) {
  console.error('Cloudinary upload failed:', error);
    return null;
  }
};

{/* Save function */}
 const handleSave = async () => {
  if (!audioURI) {
    setSaveError('Please record audio before saving.');
    setTimeout(() => setSaveError(''), 3000);
    return;
  };

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

    Alert.alert('🎉Success', 'Audio saved successfully!');

    // Reset state
    setAudioURI(null);
    setRecordingTime(0);

    //Refresh list and close modal
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
    <Text style={styles.title}>Record Audio</Text>
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

  {/* Error on save */}
  {saveError !== '' && <Text style={styles.errorText}>{saveError}</Text>}
 
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

errorText: {
  color: '#E94F4F',
  marginTop: 6,
  marginBottom: 4,
  fontSize: 13,
  fontWeight: '500',
  fontStyle: 'italic',
},

});

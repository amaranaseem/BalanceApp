import { StyleSheet, Text, View, TouchableOpacity, ScrollView, KeyboardAvoidingView, TextInput, Alert } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from '../firebase';

const moods = [
  { label: 'joy', color: '#FFE38E' },
  { label: 'sad', color: '#90C3E6' },
  { label: 'angry', color: '#E94F4F' },
  { label: 'fear', color: '#C9B8FF' },
  { label: 'calm', color: '#B8E2DC' },
  { label: 'neutral', color: '#B7A282' },
  { label: 'surprise', color: '#F7C59F' },
  { label: 'disgust', color: '#BFD8A5' },
  { label: 'contempt', color: '#D8A7B1' },
];

const NotepadScreen = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [title, setTitle] = useState('');
  const [saveError, setSaveError] = useState('');
  const navigation = useNavigation();
  const [recording, setRecording] = useState(null);
  const [audioURI, setAudioURI] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  {/* Play Audio function */}
  const playRecording = async () => {
    try {
      if (!audioURI) return;

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioURI },
        { shouldPlay: true }
      );
      setSound(sound);
      setIsPlaying(true);

      sound.setOnPlaybackStatusUpdate(status => {
        if (!status.isPlaying) {
          setIsPlaying(false);
        }
      });

      await sound.playAsync();
    } catch (error) {
      console.error('Playback error:', error);
    }
  };

  {/* Start Audio function */}
  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access microphone is required!');
        return;
      }

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecordingTime(0);
      setRecording(recording);

      setTimeout(() => stopRecording(), 60000);
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

  {/* Save function */}

  const handleSave = async () => {
    setSaveError('');

    if (!selectedMood) {
      setSaveError('Please select a mood before saving.');
      setTimeout(() => setSaveError(''), 3000);
      return;
    }

    if (!note && !audioURI) {
      setSaveError('Please write something or record audio.');
      return;
    }

    setUploading(true);

    try {
      let audioUrl = null;

      if (audioURI) {
        const response = await fetch(audioURI);
        const blob = await response.blob();
        const audioRef = ref(storage, `audioNotes/${Date.now()}.m4a`);
        await uploadBytes(audioRef, blob);
        audioUrl = await getDownloadURL(audioRef);
      }

      await addDoc(collection(db, 'entries'), {
        title: title || 'Untitled',
        mood: selectedMood.label,
        moodColor: selectedMood.color,
        note: note || '',
        audioUrl: audioUrl || '',
        createdAt: serverTimestamp(),
      });

      Alert.alert("🎉 Saved!", "Your journal entry was saved.", [
        {
          text: "OK",
          onPress: () => {
            setTitle('');
            setNote('');
            setAudioURI(null);
            setSelectedMood(null);
            navigation.navigate('BottomNavTab', { screen: 'Journal' });
          },
        },
      ]);
    } catch (error) {
      console.error("Save error:", error);
      setSaveError('Failed to save. Try again.');
    }

    setUploading(false);
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
          <TouchableOpacity
            style={styles.closeCircle}
            onPress={() => navigation.navigate('BottomNavTab', { screen: 'Journal' })}
          >
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
            <TouchableOpacity
              key={index}
              style={[
                styles.moodItem,
                selectedMood?.label === mood.label && { backgroundColor: mood.color },
              ]}
              onPress={() => setSelectedMood(mood)}
            >
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
            <Ionicons name={isPlaying ? "pause" : "play"} size={22} color="#A58E74" />
          </TouchableOpacity>
          <View style={styles.waveform} />
          <Text style={styles.timerText}>{formatTime(recordingTime)}</Text>
          <Ionicons name="time" size={18} color="#A58E74" />
          <TouchableOpacity onPress={() => setAudioURI(null)} style={{ marginLeft: 10 }}>
            <Ionicons name="trash" size={20} color="#A58E74" />
          </TouchableOpacity>
        </View>
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default NotepadScreen;

const styles = StyleSheet.create({
container: {
  flexGrow: 1,
  paddingTop: 40,
  paddingHorizontal: 20,
  paddingBottom: 10,
  backgroundColor: '#FAF9F6',
},

topRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  marginBottom: 20,
},

headerTextInput: {
  fontSize: 24,
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
  backgroundColor: '#D8CAB8',
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
  borderColor: '#D8CAB8',
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
  backgroundColor: '#E6E1D7',
  padding: 12,
  borderRadius: 50,
  width: 56,
  height: 56,
  justifyContent: 'center',
  alignItems: 'center',
},

saveBtn: {
  backgroundColor: '#A58E74',
  paddingVertical: 14,
  paddingHorizontal: 32,
  borderRadius: 18,
},
  
saveText: {
  fontWeight: 'bold',
  color: 'white',
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

audioContainer: {
  marginTop: 20,
  padding: 12,
  borderRadius: 14,
  backgroundColor: '#fff',
  borderWidth: 1,
  borderColor: '#D8CAB8',
  height: 83,
},

audioBar: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 10,
  paddingHorizontal: 12,
  borderRadius: 20,
  backgroundColor: '#fff',
  marginBottom: 16,
},

waveform: {
  flex: 1,
  height: 16,
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
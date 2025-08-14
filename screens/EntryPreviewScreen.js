import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useNavigation, useRoute } from '@react-navigation/native';

const EntryPreviewScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { entry } = route.params;
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

{/* Converting sec into mm:ss format */}
 const formatTime = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

 {/* Play Audio function */}
 const playAudio = async () => {
 try{
  if (!entry.audioURL) return;

  // Load audio if not loaded yet
  let currentSound = sound;
  if (!currentSound) {
   const { sound: newSound } = await Audio.Sound.createAsync(
    { uri: entry.audioURL}
  );
    
  // Listener for audio stop/finish
   newSound.setOnPlaybackStatusUpdate(status => {
   if (status.didJustFinish || !status.isPlaying) {
    setIsPlaying(false);
    }
  });
   
  //store loaded audio in state, no need to reload again
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

  useEffect(() => {
  return () => {
    if (sound) {
      sound.unloadAsync();
    }
  };
}, [sound]);

return (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
  
  <View style={styles.topRow}>
  <Text style={styles.title}>{entry.title}</Text>
  
  <TouchableOpacity style={styles.closeCircle} onPress={() => navigation.goBack()}>
    <Ionicons name="close" size={24} color="black" />
  </TouchableOpacity>
  </View>

  <Text style={styles.dateText}>{entry.date}</Text>

  <View style={[styles.moodTag, { backgroundColor: entry.moodColor || '#f4e2b8' }]}>
    <Text style={styles.moodText}>{entry.mood}</Text>
  </View>

  <Text style={styles.description}>{entry.description}</Text>

  {/* Audio section */}
  {entry.audioURL && (
  <View style={styles.audioContainer}>
  
  <TouchableOpacity onPress={playAudio}>
  <Ionicons name={isPlaying ? 'pause-circle' : 'play-circle'} size={46} color="#FF91A4" />
  </TouchableOpacity>
  
  <Text style={styles.audioText}> {isPlaying ? 'Playing...' : formatTime(entry.duration || 0)} </Text>
  </View>
  )}

  </ScrollView>
 );
};

export default EntryPreviewScreen;

const styles = StyleSheet.create({
container: {
  flex: 1,
  marginTop: 40,
  paddingHorizontal: 20,
  paddingVertical: 20,
  backgroundColor: '#fff',
},

content: {
  padding: 20,
  paddingBottom: 100, 
},

topRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  marginBottom: 20,
},

title: {
  fontSize: 26,
  fontWeight: 'bold',
  color: '#50483D',
  flex: 1,
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

dateText: {
  color: '#7A6E5D',
  fontSize: 14,
  marginTop: 6,
  marginBottom: 10,
},

moodTag: {
  alignSelf: 'flex-start',
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 12,
  marginBottom: 18,
  marginTop: 10,
},

moodText: {
  fontWeight: 'bold',
  color: '#000',
},

description: {
  fontSize: 16,
  color: '#333',
  lineHeight: 24,
},

audioContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 12,
  borderRadius: 35,
  marginTop: 5,
  borderColor: '#A8D5BA',
  borderWidth: 2
},

durationText: {
  fontSize: 14,
  fontWeight: '500',
  color: '#000',
},
});

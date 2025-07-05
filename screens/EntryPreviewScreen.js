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

  const formatTime = (duration) => {
    if (!duration) return '';
    const mins = Math.floor(duration / 60);
    const secs = Math.floor(duration % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const playAudio = async () => {
    if (!entry.audioURL) return;

    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
      return;
    }

    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: entry.audioURL },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
          newSound.unloadAsync();
          setSound(null);
        }
      });

      await newSound.playAsync();
    } catch (err) {
      console.error('Audio play error:', err);
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

      <Text style={styles.description}>
        {entry.description}
      </Text>

      {/* Audio section */}
      {entry.audioURL && (
        <View style={styles.audioContainer}>
          <TouchableOpacity onPress={playAudio}>
            <Ionicons
              name={isPlaying ? 'pause-circle' : 'play-circle'}
              size={48}
              color="#D8CAB8"
            />
          </TouchableOpacity>
          <Text style={styles.audioText}>
            {isPlaying ? 'Playing...' : formatTime(entry.duration || 0)}
          </Text>
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
    backgroundColor: '#FAF9F6',
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
    fontSize: 24,
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
   backgroundColor: '#D8CAB8',
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

  placeholder: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#888',
    marginBottom: 30,
  },

  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D8CAB8',
    marginTop: 5,
  },

  waveform: {
    flex: 1,
    height: 10,
    backgroundColor: '#ccc',
    borderRadius: 6,
    marginHorizontal: 12,
  },

  durationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
});

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';

const { width } = Dimensions.get('window');

const SessionsAudioPlayerScreen = ({ route, navigation }) => {
  const { title, tracks, imgURL } = route.params;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(1); // avoid 0
  const isLastTrack = currentIndex === tracks.length - 1;
  const isFirstTrack = currentIndex === 0;

  const loadAndPlayTrack = async (index) => {
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: tracks[index].url },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setIsPlaying(true);
    } catch (error) {
      console.error("Error loading track:", error);
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPositionMillis(status.positionMillis);
      setDurationMillis(status.durationMillis || 1);

      if (status.didJustFinish) {
        if (!isLastTrack) {
          setCurrentIndex((prev) => prev + 1); // will trigger useEffect
        } else {
          setIsPlaying(false);
        }
      }
    }
  };

  // When currentIndex changes, load corresponding track
  useEffect(() => {
    loadAndPlayTrack(currentIndex);
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [currentIndex]);

  const togglePlay = async () => {
    if (!sound) return;
    if (isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const playNext = () => {
    if (!isLastTrack) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const playPrev = () => {
    if (!isFirstTrack) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const millisToMinutes = (millis) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.closeCircle}
          onPress={() => navigation.navigate('BottomNavTab', { screen: 'Meditate' })}
        >
          <Ionicons name="close" size={22} color="black" />
        </TouchableOpacity>
      </View>

      {/* Image */}
      {imgURL && (
        <Image source={{ uri: imgURL }} style={styles.artwork} resizeMode="cover" />
      )}

      {/* Title */}
      <Text style={styles.headerTextInput}>{title}</Text>
      <Text style={{ fontSize: 16, color: '#666', marginBottom: 10, textAlign: 'center' }}>
        {tracks[currentIndex]?.title}
      </Text>

      {/* Controls Section */}
      <View style={styles.controlsSection}>
        {/* Slider */}
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={durationMillis}
          value={positionMillis}
          minimumTrackTintColor="#3C4F46"
          maximumTrackTintColor="#ccc"
          thumbTintColor="#3C4F46"
          onSlidingComplete={async (value) => {
            if (sound) await sound.setPositionAsync(value);
          }}
        />
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{millisToMinutes(positionMillis)}</Text>
          <Text style={styles.timeText}>{millisToMinutes(durationMillis)}</Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity onPress={playPrev} disabled={isFirstTrack}>
            <Ionicons name="play-back" size={30} color={isFirstTrack ? '#bbb' : '#3C4F46'} />
          </TouchableOpacity>

          <TouchableOpacity onPress={togglePlay}>
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={40}
              color="#3C4F46"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={playNext} disabled={isLastTrack}>
            <Ionicons name="play-forward" size={30} color={isLastTrack ? '#bbb' : '#3C4F46'} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default SessionsAudioPlayerScreen;

const styles = StyleSheet.create({
container: {
  flexGrow: 1,
  paddingTop: 80,
  alignItems: 'center',
  backgroundColor: '#FAF9F6',
},

topRow: {
  width: '100%',
  alignItems: 'flex-start',
  paddingHorizontal: 20,
  marginBottom: 20,
},

headerTextInput: {
  fontSize: 28,
  fontWeight: 'bold',
  color: '#3C4F46',
  textAlign: 'center',
  marginBottom: 30,
  marginTop: 20,
},

closeCircle: {
  width: 38,
  height: 38,
  borderRadius: 19,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#ccc',
  opacity: 0.8,
},

controlsSection: {
  alignItems: 'center',
  width: '100%',
},

artwork: {
  width: 250,
  height: 260,
  borderRadius: 16,
  marginBottom: 20,
  backgroundColor: '#eee',
},

slider: {
  width: 320,
  height: 40,
},

timeRow: {
  width: 320,
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingHorizontal: 4,
  marginBottom: 20,
},

timeText: {
  fontSize: 12,
  color: '#666',
},

controls: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  width: 300,
  alignItems: 'center',
  marginTop: 10,
},
});

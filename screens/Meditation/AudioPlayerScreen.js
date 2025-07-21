import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';


const AudioPlayerScreen = ({ route, navigation }) => {
  const { title, url, imgURL } = route.params;

  const sound = useRef(new Audio.Sound());
  const [isPlaying, setIsPlaying] = useState(false);
  const [durationMillis, setDurationMillis] = useState(0);
  const [positionMillis, setPositionMillis] = useState(0);

  useEffect(() => {
    loadAudio();

    return () => {
      sound.current.unloadAsync();
    };
  }, []);

  const loadAudio = async () => {
    try {
      await sound.current.loadAsync({ uri: url });
      const status = await sound.current.getStatusAsync();
      if (status.isLoaded) {
        setDurationMillis(status.durationMillis);
        sound.current.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      }
    } catch (err) {
      console.error('Audio load error:', err);
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPositionMillis(status.positionMillis);
      setDurationMillis(status.durationMillis);
      setIsPlaying(status.isPlaying);
    }
  };

  const togglePlay = async () => {
    const status = await sound.current.getStatusAsync();
    if (status.isPlaying) {
      await sound.current.pauseAsync();
    } else {
      await sound.current.playAsync();
    }
  };

  const millisToMinutes = (millis) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

return (
  <View style={styles.container}>
  <View style={styles.topRow}>
    <TouchableOpacity style={styles.closeCircle} onPress={() => navigation.navigate('BottomNavTab', {screen: 'Meditate'})} >
      <Ionicons name="close" size={22} color="black" />
    </TouchableOpacity>
  </View>

  {/* Artwork */}
  {imgURL && (
    <Image source={{ uri: imgURL }} style={styles.artwork} resizeMode="cover" />
  )}

  {/* Title */}
  <Text style={styles.headerTextInput}>{title}</Text>

  <View style= {styles.controlsSection}>
  {/* Progress Bar */}
  <Slider
    style={styles.slider}
    minimumValue={0}
    maximumValue={durationMillis}
    value={positionMillis}
    minimumTrackTintColor="#3C4F46"
    maximumTrackTintColor="#ccc"
    thumbTintColor="#3C4F46"
    disabled={true} 
  />
  <View style={styles.timeRow}>
    <Text style={styles.timeText}>{millisToMinutes(positionMillis)}</Text>
    <Text style={styles.timeText}>{millisToMinutes(durationMillis)}</Text>
  </View>

  {/* Controls */}
  <View style={styles.controls}>
   <TouchableOpacity>
    <Ionicons name="play-back" size={30} color="#3C4F46" />
   </TouchableOpacity>

  <TouchableOpacity onPress={togglePlay}>
    <Ionicons
    name={isPlaying ? 'pause' : 'play'}
    size={40}
    color="#3C4F46"
   />
  </TouchableOpacity>

  <TouchableOpacity>
  <Ionicons name="play-forward" size={30} color="#3C4F46" />
  </TouchableOpacity>
  </View>
  </View>
  </View>
  );
};

export default AudioPlayerScreen;

const styles = StyleSheet.create({
container: {
  flexGrow: 1,
  paddingTop: 80,
  alignItems: 'center',
  backgroundColor: '#fff',
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
  backgroundColor: '#FAEDDD',
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

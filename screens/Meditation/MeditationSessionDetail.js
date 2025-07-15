import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Ionicons } from '@expo/vector-icons';

const MeditationSessionDetail = ({ route, navigation }) => {
  const { sessionId } = route.params;
  const [sessionData, setSessionData] = useState(null);
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    const fetchSession = async () => {
      const docRef = doc(db, 'meditationSessions', sessionId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSessionData(docSnap.data());
      }
    };

    fetchSession();
  }, [sessionId]);

  useEffect(() => {
    const fetchTracks = async () => {
      const tracksRef = collection(db, 'meditationSessions', sessionId, 'Tracks');
      const snapshot = await getDocs(tracksRef);
      const sortedTracks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTracks(sortedTracks);
    };

    fetchTracks();
  }, [sessionId]);

  const playAll = () => {
    if (tracks.length > 0) {
      navigation.navigate('SessionsAudioPlayerScreen', {
        title: sessionData?.title,
        tracks,
        imgURL: sessionData?.imgURL
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topRow}>
        <Text style={styles.headerText}>{sessionData?.title}</Text>
        <TouchableOpacity
          style={styles.closeCircle}
          onPress={() => navigation.navigate('BottomNavTab', { screen: 'Meditate' })}
        >
          <Ionicons name="close" size={22} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView>
        {sessionData?.imgURL && (
          <Image source={{ uri: sessionData.imgURL }} style={styles.image} />
        )}

        <TouchableOpacity style={styles.playAllBtn} onPress={playAll}>
          <Ionicons name="play" size={20} color="#fff" />
          <Text style={styles.playAllText}>Play All</Text>
        </TouchableOpacity>

        {tracks.map((track) => (
          <View key={track.id} style={styles.trackItem}>
            <Text style={styles.trackTitle}>{track.title?.trim() || 'Untitled'}</Text>
            <Text style={styles.trackDuration}>{track.duration} m</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default MeditationSessionDetail;


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
  marginBottom: 40,
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

image: {
  width: '100%',
  height: 200,
  borderRadius: 12,
  marginBottom: 16
},

title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16
},

playAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#50483D',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignSelf: 'flex-start'
},

playAllText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600'
},

trackItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc'
},
  
trackTitle: {
    fontSize: 16
},
  
trackDuration: {
    fontSize: 12,
    color: '#666'
}
});

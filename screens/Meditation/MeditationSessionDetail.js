import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Ionicons } from '@expo/vector-icons';

const MeditationSessionDetail = ({ route, navigation }) => {
  const { sessionId } = route.params;
  const [sessionData, setSessionData] = useState(null);
  const [tracks, setTracks] = useState([]);

  // Fetching Session from Firebase
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

  // Fetching Tracks from Firebase
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


return (
 <View style={styles.container}>
 {/* Header */}
 <View style={styles.topRow}>
 <Text style={styles.headerText}>{sessionData?.title}</Text>
 <TouchableOpacity style={styles.closeCircle} onPress={() => navigation.navigate('BottomNavTab', { screen: 'Meditate' })}>
 <Ionicons name="close" size={22} color="black" />
 </TouchableOpacity>
 </View>

  <ScrollView>
  {sessionData?.imgURL && (
  <Image source={{ uri: sessionData.imgURL }} style={styles.image} />
  )}

  {tracks.map((track) => (
  <View key={track.id} style={styles.trackItem}>
  <Text style={styles.trackTitle}>{track.title?.trim() || 'Untitled'}</Text>
  <Text style={styles.trackDuration}>{track.duration} m</Text>

  <TouchableOpacity onPress={() => navigation.navigate('AudioPlayerScreen', {
    title: track.title,
    url: track.url,
    imgURL: sessionData?.imgURL,
   })
   } style={styles.trackPlayBtn}>
    <Ionicons name="play-circle" size={30} color="#3C4F46" />
   </TouchableOpacity>
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
  backgroundColor: '#fff',
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
  backgroundColor: '#FAEDDD',
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

trackItem: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingVertical: 12,
  borderBottomWidth: 0.5,
  borderBottomColor: '#ccc', 
  alignItems: 'center',
  paddingHorizontal: 16,
  backgroundColor: '#F0F0F0',
  borderRadius: 10,
  marginBottom: 10,
},
  
trackTitle: {
  fontSize: 16, 
  fontWeight: 'bold',
  color: '#3C4F46',
},
  
trackDuration: {
 fontSize: 14,
  color: '#777',
  marginTop: 4,
},

trackPlayBtn: {
  paddingLeft: 10,
}
});

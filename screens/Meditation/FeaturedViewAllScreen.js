import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { useFocusEffect } from '@react-navigation/native';

export default function MeditationScreen({ navigation }) {
const [featuredMeditation, setFeaturedMeditation] = useState([]); 
const [loading, setLoading] = useState(true);

useFocusEffect(
  useCallback(() => {
  const fetchFeaturedMeditation = async () => {
   try {
    const featuredRef = collection(db, 'featuredMeditation');
    const snapshot = await getDocs(featuredRef);

    const fetchMeditations = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
     id: doc.id,
     title: data.title,
     duration: data.duration, 
     url: data.url,
     isFeatured: data.isFeatured,
     imgURL: data.imgURL,
    };
  });

  setFeaturedMeditation(fetchMeditations);
  } catch (error) {
    console.error('Error fetching featured meditation:', error);
  } finally {
    setLoading(false);
    } 
  };

    fetchFeaturedMeditation();
  }, [])
);

return (
  <View style={styles.container}>
  {/* Header */}
  <View style={styles.topRow}>
  <Text style={styles.headerText}>Featured Meditation</Text>
   <TouchableOpacity style={styles.closeCircle} onPress={() => navigation.navigate('BottomNavTab', {screen: 'Meditate'})}>
    <Ionicons name="close" size={22} color="black" />
   </TouchableOpacity>
  </View>

 {/* Featured Meditation */}
  <ScrollView>
  {featuredMeditation.map((item, index) => (
  <TouchableOpacity key={item.id || index} 
    style={styles.featuredItem} 
    onPress={() => navigation.navigate('AudioPlayerScreen', { 
    title: item.title,
    url: item.url, 
    imgURL: item.imgURL,
    }
  )}
  >
  <View>
  <Text style={styles.featuredTitle}>{item.title}</Text>
  <Text style={styles.featuredSubtitle}>{item.duration}</Text>
  </View>
  <View style={styles.playBtn}>
    <Ionicons name="play" size={22} color="#fff" />
    </View>
    </TouchableOpacity>
   ))}
    </ScrollView>
    </View>
  );
}

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
  
featuredItem: {
  backgroundColor: '#EFE5E7',
  borderRadius: 15,
  padding: 16,
  marginBottom: 12,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},

featuredTitle: {
  fontSize: 16,
  fontWeight: '600',
  color: '#000',
},

featuredSubtitle: {
  fontSize: 14,
  color: '#666',
  marginTop: 4,
  color: '#000',
},

playBtn:{
  backgroundColor: '#6E1E2B', 
  borderRadius: 20, 
  width: 35, 
  height: 35, 
  justifyContent: 'center', 
  alignItems: 'center',
  elevation: 3
}, 

});

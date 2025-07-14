import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image} from 'react-native';
import React, { useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { useFocusEffect } from '@react-navigation/native';

export default function MeditationScreen({ navigation }) {
const [featuredMeditation, setFeaturedMeditation] = useState([]); 
const [loading, setLoading] = useState(true);
const [meditationSessions, setMeditationSessions] = useState([]);


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

useFocusEffect(
  useCallback(() => {
    const fetchSessions = async () => {
      try {
        const sessionRef = collection(db, 'meditationSessions');
        const snapshot = await getDocs(sessionRef);
        const fetched = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            url: data.url, 
            description: data.sessions || '',
          };
        });
        setMeditationSessions(fetched);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    };

    fetchSessions();
  }, [])
);

 {/**  const [userMeditations, setUserMeditations]= useState([]);

  useFocusEffect(
  useCallback(() => {
    const fetchUserMeditations = async () => {
      try {
        const user = auth.currentUser;
        if(!user) return;

        const userMeditationRef = collection(db, 'userMeditations');
        const q = query(userMeditationRef, where('userId', '==', user.uid));
        const snapshot = await getDocs(q);

        const fetched = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setUserMeditations(fetched);
      } catch (error) {
        console.error("Error fetching user meditations:", error);
      }
    };

    fetchUserMeditations();
  }, [])
);*/}


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topRow}>
        <Text style={styles.headerText}>Meditation</Text>
        <View style={styles.searchCircle}>
          <Ionicons name="search" size={22} color="black" />
        </View>
      </View>

      {/* Featured Meditation */}
      <ScrollView>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured</Text>
        <TouchableOpacity onPress={() => navigation.navigate('FeaturedViewAll')}>
          <Text style={styles.viewAll}>View all</Text>
        </TouchableOpacity>
      </View>
      {featuredMeditation.slice(0,3).map((item, index) => (
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
          <Ionicons name="play-circle-outline" size={28} color="#50483D" />
        </TouchableOpacity>
      ))}

      {/* Meditation Sessions*/}
      <Text style={styles.sectionTitle}>Meditation Sessions</Text>
      {meditationSessions.map((session, index) => (
      <TouchableOpacity
        key={session.id}
        style={styles.sessionCard}
        onPress={() =>
          navigation.navigate('MeditationSessionDetail', {
            sessionId: session.id,
            title: session.title,
            url: session.url,
            sessions: session.session
          })
        }
      >
      <View style={styles.sessionCardContent}>
        {session.imgURL && (
          <Image
            source={{ uri: session.imgURL }}
            style={styles.sessionImage}
          />
        )}
        <View>
          <Text style={styles.sessionTitle}>{session.title}</Text>
          {session.description ? (
            <Text style={styles.sessionSubtitle}>{session.description}</Text>
          ) : null}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={22} color="#999" />
    </TouchableOpacity>
  ))}

      {/* Your Audio Section 
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Audio</Text>
        <TouchableOpacity onPress={() => navigation.navigate('YourAudioScreen')}>
          <Ionicons name="add-circle-outline" size={24} color="#555" />
        </TouchableOpacity>
      </View>

      {userMeditations.length === 0 ? (
        <Text>No uploads yet</Text>
      ) : (
        userMeditations.map((item, index) => (
          <TouchableOpacity key={index} style={styles.userCard}>
            <View>
              <Text>{item.title}</Text>
              <Text>{item.duration}</Text>
            </View>
            <Ionicons name="play" size={24} color="#6B8EFC" />
          </TouchableOpacity>
        ))
      )}*/}
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
  backgroundColor: '#FAF9F6',
},

topRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  marginBottom: 20,
},

searchCircle: {
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

sectionHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
  marginTop: 10,
  color: '#000',
},

sectionTitle: {
  fontSize: 20,
  fontWeight: '600',
  marginBottom: 8,
  marginTop: 10,
  color: '#000',
},

viewAll: {
  fontSize: 14,
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
  fontWeight: '500',
   color: '#000',
},

featuredSubtitle: {
  fontSize: 14,
  color: '#666',
  marginTop: 4,
   color: '#000',
},

sessionCard: {
  backgroundColor: '#F5EBE4',
  borderRadius: 15,
  padding: 16,
  marginBottom: 12,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},

sessionTitle: {
  fontSize: 16,
  fontWeight: '500',
  color: '#000',
},

sessionSubtitle: {
  fontSize: 12,
  color: '#999',
  marginTop: 4,
  color: '#cc'
},

userCard: {
  backgroundColor: '#E9F1F0',
  padding: 16,
  borderRadius: 12,
  marginBottom: 12,
  borderColor: '#EEE',
  borderWidth: 1,
},

sessionImage: {
  width: 50,
  height: 50,
  borderRadius: 8,
  backgroundColor: '#eee',
},
});

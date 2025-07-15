import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image} from 'react-native';
import React, { useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { addDocs, collection, getDocs, query,where } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { useFocusEffect } from '@react-navigation/native';

const MeditationScreen = ({ navigation }) => {
const [featuredMeditation, setFeaturedMeditation] = useState([]); 
const [loading, setLoading] = useState(true);
const [meditationSessions, setMeditationSessions] = useState([]);

{/*Featured Meditations*/}
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

{/*Meditation Sessions */}
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
{/*User Meditations Audio */}
 const [userMeditations, setUserMeditations]= useState([]);

  useFocusEffect(
  useCallback(() => {
    const fetchUserMeditations = async () => {
      try {
        const user = auth.currentUser;
        if(!user) return;

        const userMeditationRef = collection(db,'users', user.uid,'userMeditations');
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
);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topRow}>
        <Text style={styles.headerText}>Meditation</Text>
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
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.duration}</Text>
          </View>
          <Ionicons name="play" size={24} color="#50483D" />
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
          <Text style={styles.title}>{session.title}</Text>
          {session.description ? (
            <Text style={styles.subtitle}>{session.description}</Text>
          ) : null}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={22} color="#000" />
    </TouchableOpacity>
  ))}

      {/* Your Audio Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Audio</Text>
        <TouchableOpacity onPress={() => navigation.navigate('YourAudioScreen')}>
         <Text style={styles.viewAll}>View all</Text>
        </TouchableOpacity>
      </View>

      {userMeditations.length === 0 ? (
        <Text>No uploads yet</Text>
      ) : (
        userMeditations.slice(0,4).map((item, index) => (
          <TouchableOpacity key={item.id || index} style={styles.userCard}
          onPress={() => navigation.navigate('AudioPlayerScreen', { 
          title: item.title,
          url: item.audioURL, 
          imgURL: 'https://res.cloudinary.com/dstxsoomq/image/upload/v1752538325/audioplaceholder_tqxloj.jpg',
        }
      )}
        >
            <View>
              <Text style={styles.title}>{item.title?.trim() ? item.title : 'Untitled'}</Text>
              <Text style={styles.subtitle}>{item.duration} sec</Text>
            </View>
            <Ionicons name="play" size={24} color="#50483D"/>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
    </View>
  );
}

export default MeditationScreen;


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
  marginBottom: 10,
  marginTop: 10,
  color: '#000',
},

viewAll: {
  fontSize: 14,
  color: 'blue',
  textDecorationLine: 'underline'
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

title: {
  fontSize: 16,
  fontWeight: '600',
  color: '#000',
},

subtitle: {
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
  marginTop: 8,
},

userCard: {
  backgroundColor: '#E9F1F0',
  padding: 16,
  borderRadius: 12,
  marginBottom: 12,
  borderColor: '#EEE',
  borderWidth: 1,
  alignItems: 'center',
  justifyContent: 'space-between',
  flexDirection: 'row'
},
});

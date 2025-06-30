import React, {useState, useCallback} from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import app from '../firebase';
import { useFocusEffect } from '@react-navigation/native';
import {query, orderBy} from 'firebase/firestore';

const db = getFirestore(app);

const JournalScreen = () => {
  const navigation = useNavigation();
  const [entries, setEntries] = useState([]);

  useFocusEffect(
  useCallback(() => {
    const fetchEntries = async () => {
      try {
        const entriesRef = collection(db, 'entries');
        const q = query(entriesRef, orderBy('createdAt', 'desc'));  //sorting the entries

        const snapshot = await getDocs(q);
        const firebaseEntries = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || 'Untitled',
            mood: data.mood || 'Neutral',
            moodColor: data.moodColor || '#D8CAB8',
            date: data.createdAt?.toDate().toLocaleDateString('en-GB') || 'Unknown',
            description: data.note || '',
            hasAudio: !!data.audioURL,
            duration: data.duration || '',
            audioURL: data.audioURL || null,
          };
        });

        setEntries(firebaseEntries);
      } catch (error) {
        console.error('Error fetching journal entries:', error);
      }
    };

    fetchEntries(); 
  }, [])
);


  const renderItem = ({ item }) => (
    <View style={styles.card}>

      {/* Title and Date*/}
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDate}>{item.date}</Text>
      </View>

      {/* Mood Tag */}
      <View style={[styles.moodTag, { backgroundColor: item.moodColor }]}>
        <Text style={styles.moodText}>{item.mood}</Text>
      </View>

      {/* Description */}
      {item.description && (
        <Text style={styles.cardText} numberOfLines={5}>
          {item.description}
        </Text>
      )}

      {/* Audio */}
      {item.hasAudio && (
        <View style={styles.audio}>
          <Ionicons name="play" size={20} color="black" />
          <Text style={styles.audioText}>{item.duration}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.topRow}>
        <Text style={styles.headerText}>My Journal</Text>
      </View>

      {/* Entries */}
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* Floating Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Notepad')}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default JournalScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#50483D',
    marginBottom: 20,
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

  card: {
    backgroundColor: '#F6EFE6',
    borderColor: '#D8CAB8',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#50483D',
  },

  cardDate: {
    fontSize: 13,
    color: '#7A6F5F',
  },

  moodTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginVertical: 6,
  },

  moodText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'black',
    textTransform: 'capitalize',
  },

  cardText: {
    fontSize: 13,
    color: '#50483D',
    marginBottom: 8,
  },

  audio: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },

  audioText: {
    fontSize: 12,
    color: '#50483D',
  },

  fab: {
    position: 'absolute',
    right: 30,
    bottom: 30,
    backgroundColor: '#A58E74',
    borderRadius: 40,
    padding: 18,
    elevation: 5,
  },
});

import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const journalEntries = [
  {
    id: '1',
    title: 'Happiest Day',
    mood: 'joy',
    moodColor: '#FFE38E',
    date: '10-02-25',
    description: 'Today was a great day. I am soo..',
    hasAudio: true,
    duration: '1:24m',
  },
  {
    id: '2',
    title: 'Okayyy',
    mood: 'angry',
    moodColor: '#E94F4F',
    date: '10-03-25',
    description: 'Today was the worst day of my life...',
    hasAudio: true,
    duration: '1:20m',
  },
  {
    id: '3',
    title: 'Hmmm',
    mood: 'Neutral',
    moodColor: '#B7A282',
    date: '10-04-25',
    description: 'Today wasn’t good or bad... I just feel neutral.',
    hasAudio: false,
    duration: '1:20m',
  },
  {
    id: '4',
    title: 'I feel relaxed',
    mood: 'Calm',
    moodColor: '#B8E2DC',
    date: '10-05-25',
    hasAudio: true,
    duration: '1:00m',
  },
];

const JournalScreen = () => {
  const navigation = useNavigation();
  

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
        data={journalEntries}
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

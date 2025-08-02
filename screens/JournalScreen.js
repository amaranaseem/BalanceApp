import React, {useState, useCallback} from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import app from '../firebase';
import { useFocusEffect } from '@react-navigation/native';
import {query, orderBy} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import EntryPreviewScreen from './EntryPreviewScreen'; 


const db = getFirestore(app);

const JournalScreen = () => {
  const navigation = useNavigation();
  const [entries, setEntries] = useState([]); 
  const [loading, setLoading] = useState(true);

// getting items from firebase
 const fetchEntries = async () => {
  try {
  const user = getAuth().currentUser;
  if (!user) return;

  const entriesRef = collection(db, 'users', user.uid, 'entries'); // location of the entries
  const q = query(entriesRef, orderBy('createdAt', 'desc')); // setting the view order 
  const snapshot = await getDocs(q);

  const firebaseEntries = snapshot.docs.map((doc) => {
  const data = doc.data();
  return { //data to be fetched from firebase
   id: doc.id,
   title: data.title || 'Untitled',
   mood: data.mood,
   moodColor: data.moodColor,
   date: data.createdAt?.toDate().toLocaleDateString('en-GB') || 'Unknown',
   description: data.note || '',
   hasAudio: !!data.audioURL,   // audio link
   duration: data.duration || '', 
   audioURL: data.audioURL || null,
    };
  });

  setEntries(firebaseEntries);
  } catch (error) {
    console.error('Error fetching journal entries:', error);
   } finally {
    setLoading(false);
   } 
  };

    
  // delete entry
  const deleteEntry = async (id) => {
  try {
    const user = getAuth().currentUser;
    if (!user) return;
 
    await deleteDoc(doc(db, 'users', user.uid, 'entries', id));
    fetchEntries(); //refersh after deletion
  } catch (error) {
   console.error('Error deleting entry:', error);
  }
  };
 
  // confirm delete entry
  const confirmDelete = (id) => {
   Alert.alert(
    '❌ Delete Entry',
    'Are you sure you want to delete this entry?',
  [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: () => deleteEntry(id) },
   ]);
  };

 useFocusEffect(
  useCallback(() => {
  fetchEntries();
   }, [])
  );
 
  //for viewing the entries made
  const renderItem = ({ item }) => (
  <TouchableOpacity style= {styles.card} onPress={() => navigation.navigate('EntryPreview', { entry: 
   {
    title: item.title, 
    date: item.date, 
    mood: item.mood,
    moodColor: item.moodColor, 
    description: item.description, 
    audioURL: item.audioURL, 
    duration: item.duration
   }
  })}>

  {/* Title and Date*/}
  <View style={styles.cardHeader}>
  <Text style={styles.cardTitle}>{item.title}</Text>
  <Text style={styles.cardDate}>{item.date}</Text>
  </View>

  {/* Mood Tag */}
  <View style={[styles.moodTag, { backgroundColor: item.moodColor }]}>
  <Text style={[styles.moodText, { color: '#000' }]}>
  {item.mood}
  </Text>
  </View>

  {/* Description */}
  {item.description && (
  <Text style={styles.cardText} numberOfLines={5}>
    {item.description}
  </Text>
  )}

 {/* Audio */}
 <View style={styles.cardBottomRow}>
 {item.hasAudio && (
 <View style={styles.audio}>
 <Ionicons name="play" size={20} color="black" />
 <Text style={styles.audioText}>{item.duration < 60 
  ? `${item.duration.toFixed(1)}s` 
  : `${(item.duration / 60).toFixed(1)}m`}
 </Text>
  </View>
  )}

  {/* Delete Button */}
  <TouchableOpacity onPress={() => confirmDelete(item.id)} style={styles.deleteButton}>
  <Ionicons name="trash" size={20} color="#E94F4F" />
  </TouchableOpacity>
  </View>
  </TouchableOpacity>
 );

return (
  <View style={styles.container}>

  {/* Header */}
 <View style={styles.topRow}>
 <Text style={styles.headerText}>My Journal</Text>
 </View>

 {/* Entries */}
 {loading ? (
 <ActivityIndicator size="large" color="#000" style={{ marginTop: 50 }} />
  ) : (
 <FlatList
  data={entries}
  keyExtractor={(item) => item.id}
  renderItem={renderItem}
  ListEmptyComponent={<Text style={styles.placeholder}>No journal entries yet. Start writing!</Text>}
  contentContainerStyle={{ paddingBottom: 100 }}
 />
  )}
      
  {/* Floating Button */}
  <TouchableOpacity
  style={styles.fab}
  onPress={() => navigation.navigate('Notepad')}
  >
   <Ionicons name="add" size={28} color="black" />
  </TouchableOpacity>
   </View>
  );
};

export default JournalScreen;

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
  marginBottom: 20,
},

card: {
  backgroundColor: '#FAEDDD',
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

cardBottomRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 10,
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

deleteButton: {
  padding: 4,
  borderRadius: 8,
},

fab: {
  position: 'absolute',
  right: 30,
  bottom: 30,
  backgroundColor: '#A8D5BA',
  borderRadius: 40,
  padding: 18,
  elevation: 5,
},

placeholder: {
  justifyContent: 'center', 
  textAlign: 'center', 
  marginTop: 200, 
  color: '#777', 
  fontSize: 17,
}

});

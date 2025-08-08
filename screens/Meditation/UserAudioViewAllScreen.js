import React, {useState, useCallback} from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Modal, Alert} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, getDocs, deleteDoc, doc} from 'firebase/firestore';
import app from '../../firebase';
import { useFocusEffect } from '@react-navigation/native';
import {query, orderBy} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import AudioRecorderModal from './AudioRecorderModal';


const db = getFirestore(app);

const UserAudioViewAll = () => {
  const navigation = useNavigation();
  const [userMeditations, setUserMeditations] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const user = getAuth().currentUser;


 // delete task
  const deleteAudio = async (id) => {
   try {
    await deleteDoc(doc(db, 'users', user.uid, 'userMeditations', id));
    fetchUserMeditations();
   } catch (error) {
   console.error('Error deleting audio:', error);
   }
  };

  // confirm delete task
  const confirmDelete = (id) => {
   Alert.alert(
    '❌ Delete Task',
    'Are you sure you want to delete this task?',
  [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: () => deleteAudio(id) },
    ]
   );
  };

 //Fetching user meditation from firebase
  const fetchUserMeditations = async () => {
  try {
  const user = getAuth().currentUser;
  if (!user) return;
  const userMeditationRef = collection(db, 'users', user.uid, 'userMeditations');
  const q = query(userMeditationRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  const firebaseuserMeditations = snapshot.docs.map((doc) => {
  const data = doc.data();
  return {
  id: doc.id,
  title: data.title || 'Untitled',
  duration: data.duration, 
  audioURL: data.audioURL || null,
  };
  });

  setUserMeditations(firebaseuserMeditations);
  } catch (error) {
  console.error('Error fetching audios:', error);
  } finally {
  setLoading(false);
  } 
    };

  useFocusEffect(
  useCallback(() => {
    fetchUserMeditations();
    }, [])
  );

const renderItem = ({ item }) => (
  <View style={styles.audioCard}>
   <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
   <View>
    <Text style={styles.title}>{item.title}</Text>
    <Text style={styles.subtitle}>{item.duration}s</Text>
   </View>

   <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20}}>
   <TouchableOpacity onPress={() => navigation.navigate('AudioPlayerScreen', {
    title: item.title,
    url: item.audioURL,
    imgURL:'https://res.cloudinary.com/dstxsoomq/image/upload/v1752538325/audioplaceholder_tqxloj.jpg'
   })} style={styles.playBtn}
   >
    <Ionicons name="play" size={22} color="#fff" />
    </TouchableOpacity>

   <TouchableOpacity onPress={() => confirmDelete(item.id)} style={styles.deleteBtn}>
   <Ionicons name="trash" size={22} color="#E94F4F" />
   </TouchableOpacity>

  </View>
  </View>
  </View>
);

return (
  <View style={styles.container}>
  {/* Header */}
  <View style={styles.topRow}>
  <Text style={styles.headerText}>My Audio</Text>
  <TouchableOpacity style={styles.closeCircle} onPress={() => navigation.navigate('BottomNavTab', {screen: 'Meditate'})}>
    <Ionicons name="close" size={22} color="black" />
    </TouchableOpacity>
  </View>

  {/* Audio Entries */}
  {loading ? (
  <ActivityIndicator size="large" color="#000" style={{ marginTop: 50 }} />
  ) : (
   <FlatList
   data={userMeditations}
   keyExtractor={(item) => item.id}
   renderItem={renderItem}
   ListEmptyComponent={<Text style={styles.placeholder}>No audio entry yet. Start recording!</Text>}
   contentContainerStyle={{ paddingBottom: 100 }}
    />
   )}

  {/* Add Tasks Button */}
  <TouchableOpacity style={styles.saveBtn} onPress={() => setModalVisible(true)}>
    <Text style={styles.saveText}>+ Add</Text>
  </TouchableOpacity>
    
  {/* Modal */}
  <Modal visible={modalVisible} animationType="fade" transparent>
    <View style={styles.modalBackground}>
    <View style={styles.modalContainer}>
    <AudioRecorderModal closeModal={() => setModalVisible(false)} onSave={fetchUserMeditations} />
    </View>
    </View>
  </Modal>
  </View>
    );
  };

export default UserAudioViewAll;

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
  marginBottom: 20,
},

headerText: {
  fontSize: 26,
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
  backgroundColor: '#FAEDDD',
  opacity: 0.8,
},

audioText: {
  fontSize: 12,
  color: '#50483D',
},

saveBtn: {
  marginBottom: 30,
  backgroundColor: '#A8D5BA',
  padding: 14,
  borderRadius: 15,
  alignItems: 'center',
},

saveText: {
  fontWeight: 'bold',
  color: 'black',
},

modalBackground: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},

modalContainer: {
  width: '90%',
  backgroundColor: '#fff',
  borderRadius: 20,
  padding: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
}, 

audioCard: {
  backgroundColor: '#E9F1F0',
  padding: 16,
  borderRadius: 12,
  marginBottom: 12,
  width: '100%'
},

title: {
  fontSize: 16,
  fontWeight: 'bold',
},

subtitle: {
  fontSize: 14,
  color: '#666',
},

placeholder:{
  justifyContent: 'center', 
  textAlign: 'center', 
  marginTop: 100, 
  color: '#777', 
  fontSize: 17,
}, 

playBtn:{
  backgroundColor: '#007272', 
  borderRadius: 20, 
  width: 35, 
  height: 35, 
  justifyContent: 'center', 
  alignItems: 'center',
  elevation: 3
}, 

deleteBtn:{
  backgroundColor: '#fff', 
  borderRadius: 20, 
  width: 35, 
  height: 35, 
  justifyContent: 'center', 
  alignItems: 'center',
  elevation: 3
}, 


});

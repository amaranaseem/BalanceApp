import React, {useState, useCallback} from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Modal} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import app from '../../firebase';
import { useFocusEffect } from '@react-navigation/native';
import {query, orderBy} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import AudioRecorderModal from './AudioRecorderModal';


const db = getFirestore(app);

const YourAudioScreen = () => {
  const navigation = useNavigation();
  const [userMeditations, setUserMeditations] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

 
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
      <TouchableOpacity onPress={() => navigation.navigate('AudioPlayerScreen', {
        title: item.title,
        url: item.audioURL,
        imgURL:'https://res.cloudinary.com/dstxsoomq/image/upload/v1752538325/audioplaceholder_tqxloj.jpg'
        })}
      >
        <Ionicons name="play" size={28} color="#50483D" />
      </TouchableOpacity>
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

export default YourAudioScreen;

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
  marginBottom: '12',
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


});

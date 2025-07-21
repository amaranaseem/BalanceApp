import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, Modal } from 'react-native';
import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { Ionicons} from '@expo/vector-icons';
import { doc, getDoc, collection, getDocs, query, orderBy} from 'firebase/firestore';
import { db } from '../firebase';
import EditProfileScreen from './EditProfileScreen';

const achievements = [
  { icon: "🎉", text: "3 habits maintained for 7 days in a row!" },
  { icon: "🥇", text: "You completed 85% of your May goals" },
  { icon: "🔥", text: "You're on a 10-day streak!" },
];

const AchievementItem = ({ icon, text }) => (
  <View style={styles.achievementItem}>
    <Text style={styles.icon}>{icon}</Text>
    <Text style={styles.achievementLabel}>{text}</Text>
  </View>
);

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [checkInCount, setCheckInCount] = useState(0);
  const [journalCount, setJournalCount] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const [consistency, setMoodConsistency] = useState(0);
  const [topMood, setTopMood] = useState('');
  
  const user = getAuth().currentUser;

const fetchProfileData = async () => {
  if (!user) return;

  try {
  const userRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
  setUserData(docSnap.data());
  }

{/*getting check-ins, journal and streaks overview from firebase */}
  
  const checkInsSnap = await getDocs(collection(db, 'users', user.uid, 'moodCheckins'));
  const journalsSnap = await getDocs(collection(db, 'users', user.uid, 'entries'));

  setCheckInCount(checkInsSnap.size);
  setJournalCount(journalsSnap.size);

  const datesSet = new Set();
  checkInsSnap.forEach(doc => {
  const data = doc.data();
  const createdAt = data.createdAt?.toDate?.() || new Date(data.createdAt);
  datesSet.add(createdAt.toDateString());
  });

  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
  const date = new Date(today);
  date.setDate(today.getDate() - i);
  if (datesSet.has(date.toDateString())) {
  streak++;
  } else {
  break;
  }
 }
  setStreakCount(streak);

{/*getting moods overview from firebase */}

const moodRef = collection(db, 'users', user.uid, 'moodCheckins');
const q = query(moodRef, orderBy('createdAt'));
const snapshot = await getDocs(q);

const moodCounts = {};
snapshot.forEach(doc => {
  const data = doc.data();
  const mood = data.mood;
  if (mood) {
    moodCounts[mood] = (moodCounts[mood] || 0) + 1;
  }
});

const total = Object.values(moodCounts).reduce((a, b) => a + b, 0);
const avg = total / Object.keys(moodCounts).length || 0;

let variation = 0;
Object.values(moodCounts).forEach(count => {
  variation += Math.abs(count - avg);
});

const consistency = total ? Math.max(0, 100 - Math.floor((variation / total) * 100)) : 0;
setMoodConsistency(consistency);

const top = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
setTopMood(top);
} catch (err) {
  console.error('Error fetching profile data:', err);
  }
};
 useEffect(() => {
  fetchProfileData();
}, []);


return (
<View style={styles.container}>

{/* Header */}
<View style={styles.topRow}>
<TouchableOpacity  style={styles.closeCircle} onPress={() => navigation.navigate('SettingScreen')}>
  <Ionicons name="settings-outline" size={22} color="black" />
</TouchableOpacity>

<TouchableOpacity onPress={() => navigation.navigate('BottomNavTab', { screen: 'HomeScreen' })}>
  <Ionicons name="chevron-back-outline" size={24} color="black" />
</TouchableOpacity>
</View>

<ScrollView showsVerticalScrollIndicator = {false}>

{/*Profile pic and information */}
{userData && (
 <>
<View style={styles.profileRow}>
<Image
  source={userData.profileImage ? { uri: userData.profileImage } : require('../assets/profilepic.png')}
  style={styles.profileImage}
/>
<TouchableOpacity style={styles.editIconWrapper} onPress={() => setEditProfileModalVisible(true)}>
   <Ionicons name="pencil" size={16} color="#000"/>
</TouchableOpacity>

<View style={styles.profileInfo}>
<Text style={styles.name}>{userData.name}</Text>
<Text style={styles.username}>@{userData.username}</Text>
</View>
</View>

{/* Status Overview */}
<View style={styles.gridRow}>

{/* Check-ins */}
<View style={styles.statCard}>
<Ionicons name="checkbox-outline" size={22} color="#A58E74" />
<Text style={styles.statLabel}>Check-ins</Text>
<Text style={styles.statNumber}>{checkInCount}</Text>
</View>

{/* Journal */}
<View style={styles.statCard}>
<Ionicons name="book-outline" size={22} color="#A58E74" />
<Text style={styles.statLabel}>Journal</Text>
<Text style={styles.statNumber}>{journalCount}</Text>
</View>

{/* Streaks */}
<View style={styles.statCard}>
<Ionicons name="ribbon-outline" size={22} color="#A58E74" />
<Text style={styles.statLabel}>Streaks</Text>
<Text style={styles.statNumber}>{streakCount}</Text>
</View>
</View>

<View style={styles.gridRow}>
{/* Top Mood */}
<View style={styles.statCard}>
<Ionicons name="happy-outline" size={22} color="#A58E74" />
<Text style={styles.statLabel}>Top Mood</Text>
<Text style={styles.statNumber}>{topMood || '-'} </Text>
</View>

{/* Streaks */}
<View style={styles.statCard}>
<Ionicons name="analytics-outline" size={22} color="#A58E74" />
<Text style={styles.statLabel}>Consistency</Text>
<Text style={styles.statNumber}>{consistency}%</Text>
</View>
</View>

</>
)}

{/* Achievements Section*/}
<Text style={styles.sectionTitle}>Achievements</Text>
<View style={styles.achievementContainer}>
{achievements.map((item, index) => (
<AchievementItem key={index} icon={item.icon} text={item.text} />
))}
<Text style={styles.unachievedItem}>💡 Started your first self-care habit</Text>
<Text style={styles.unachievedItem}>⏰ You didn't miss a reminder this week!</Text>
<Text style={styles.unachievedItem}>💯 Maintained full consistency for 1 week!</Text>
</View>

{/* Modal for editing profile*/}
<Modal visible={editProfileModalVisible} animationType="fade" transparent>
<View style={styles.modalBackground}>
<View style={styles.modalContainer}>
<EditProfileScreen
  userData={userData}
  setUserData={setUserData}
  closeModal={() => setEditProfileModalVisible(false)}
/>
</View>
</View>
</Modal>

</ScrollView>
</View>
);
};

export default ProfileScreen;

const styles = StyleSheet.create({
container: {
  flex: 1,
  paddingTop: 60,
  paddingHorizontal: 20,
  paddingVertical: 20,
  backgroundColor: '#ffff',
},

topRow: {
  flexDirection: 'row-reverse',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  marginBottom: 10,
},

headerTextInput: {
  fontSize: 24,
  fontWeight: 'bold',
  flex: 1,
  color: '#50483D',
},
  
closeCircle: {
  width: 34,
  height: 34,
  borderRadius: 19,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#FAEDDD',
  opacity: 0.8,
},

profileImage: {
  width: 80,
  height: 80,
  borderRadius: 50,
  borderWidth: 0.5,
},

profileRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 20,
},

profileInfo: {
  marginLeft: 18,
},

name: {
  fontSize: 20,
  fontWeight: '600',
  color: '#50483D',
  marginTop: 10,
},

username: {
  fontSize: 14,
  color: '#7F7B73',
},

editIconWrapper: {
  position: 'absolute',
  right: 260, 
  bottom: 5,
  backgroundColor: '#FAEDDD',
  borderRadius: 20,
  padding: 6,
},


statsBox: {
  backgroundColor: '#FAEDDD',
  padding: 16,
  borderRadius: 10,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 20,
},

statsLabel: {
  fontSize: 16,
  color: '#50483D',
  flex: 1,
  marginLeft: 10,
},

statsValue: {
  fontSize: 18,
  fontWeight: '600',
  color: '#50483D',
},

gridRow: {
  flexDirection: 'row',
  justifyContent: 'space-evenly',
  marginBottom: 15,
  marginTop: 15,
  alignItems: 'center'
},

statCard: {
  backgroundColor: '#FAEDDD',
  width: '30%',
  paddingVertical: 16,
  borderRadius: 12,
  alignItems: 'center',
},

statLabel: {
  fontSize: 14,
  color: '#50483D',
  marginTop: 8,
},

statNumber: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#50483D',
  marginTop: 4,
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
  borderRadius: 12,
  padding: 20,
},

sectionTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#50483D',
  marginBottom: 10,
  marginTop: 20
},

achievementContainer: {
  marginTop: 16,
  alignContent: 'space-evenly',
},

achievementItem: {
  backgroundColor: '#FAEDDD',
  flexDirection: 'row',
  alignItems: 'center',
  marginVertical: 5,
  borderRadius: 30,
  padding: 14
},

unachievedItem:{
  backgroundColor: '#D9D9D9',
  flexDirection: 'row',
  alignItems: 'center',
  marginVertical: 5,
  borderRadius: 30,
  padding: 14, 
  opacity: 0.4
},

icon: {
  fontSize: 16,
  marginRight: 10,
},

achievementLabel: {
  fontSize: 14,
  color: '#333',
},

});

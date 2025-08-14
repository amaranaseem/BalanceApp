import { StyleSheet, Text, View, Dimensions, ScrollView, ActivityIndicator, TouchableOpacity, Alert} from 'react-native';
import React, { useEffect, useState } from 'react';
import { LineChart } from 'react-native-chart-kit';
import { getFirestore, collection, query, getDocs, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import app from '../firebase';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width - 32;
const db = getFirestore(app);

const moods = [
  { label: 'joy', color: '#FFE38E' },
  { label: 'sad', color: '#90C3E6' },
  { label: 'angry', color: '#E94F4F' },
  { label: 'anxiety', color: '#C9B8FF' },
  { label: 'calm', color: '#B8E2DC' },
  { label: 'neutral', color: '#B7A282' },
];

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const InsightScreen = () => {
  const [moodData, setMoodData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topEmotion, setTopEmotion] = useState(null);
  const [loggedDaysCount, setLoggedDaysCount] = useState(0);
  const [moodConsistency, setMoodConsistency] = useState(0)
  const [allCheckins, setAllCheckins] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);

  {/*Setting up the weekdays */}
  const getWeekRange = (offset) => {
    const today = new Date();
    const start = new Date(today);

    start.setDate(today.getDate() - start.getDay() + 1 + offset * 7 ); 
    start.setHours(0,0,0,0);

    const end = new Date(start);

    end.setDate(start.getDate() + 6); 
    end.setHours(23,59,59,999);
    return {start, end};
  };

  //display date in DAY:DATE:MONTH format
  const formatDateRange = (start, end) => {
    const format = (d) =>
    `${d.toLocaleString('default', { weekday: 'short', day: 'numeric', month: 'short'})}`;
     return `${format(start)} - ${format(end)}`;  
  };

  {/*getting Mood Data from firebase */}
  useEffect(() => {
  const fetchMoodData = async () => {
   try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) return;

    const moodRef = collection(db, 'users', user.uid, 'moodCheckins');
    const q = query(moodRef, orderBy('createdAt'));
    const snapshot = await getDocs(q);

    const moodEntries = snapshot.docs.map(doc => doc.data());
    setAllCheckins(moodEntries);
    setLoading(false);
  
    } catch (error) {
      console.error('Error fetching mood data:', error);
      setLoading(false);
    }
   }; 
    fetchMoodData();
  }, []);

  //Ensure only the present week moods are displayed
  useEffect(() => {
    if(!allCheckins.length) return; //if no moodcheck-ins

    //get date range for the current week
    const {start: weekStartDate, end: weekEndDate} = getWeekRange(weekOffset);
    
    //filter all moods to display current week mood 
    const checkinsThisWeek = allCheckins.filter(checkin => {
      const checkinDate = checkin.createdAt?.toDate?.();
      return checkinDate >= weekStartDate && checkinDate <= weekEndDate;
    });

    //Creating a blank mood trends
    const moodTrends = {};
    moods.forEach(moodItem => { 
    moodTrends[moodItem.label] = Array(7).fill(null);
    });

    //filling moodtrend with actual mood score 
    checkinsThisWeek.forEach(checkin => {
      const date = checkin.createdAt?.toDate();
      const dayofWeek = date?.getDay();  
      const adjustedDayIndex = (dayofWeek === 0) ? 6: dayofWeek - 1; //shift to monday = 0
      const moodLabel = checkin.mood;
    
      if (moodLabel && moodTrends[moodLabel]) {
        //higher number to "better" mood
      const moodScore = 7 - moods.findIndex(m => m.label === moodLabel);
      moodTrends[moodLabel][adjustedDayIndex] = moodScore;
    }
    });

    setMoodData(moodTrends); //save filled-in mood trends

    //checking mood logged in the week
    const dayWithMood = new Set();
     Object.values(moodTrends).forEach(moodArray => {
      moodArray.forEach((score, dayIndex) => {
      if (score !== null) dayWithMood.add(dayIndex);
        });
    });
    setLoggedDaysCount(dayWithMood.size);

    // Find Top mood
    let moodFrequency = {}; 
    let topMood = null;
    let highestCount = 0;

    Object.entries(moodTrends).forEach(([label, values]) => {
    values.forEach(v => { if (v !== null) { 
    moodFrequency[label] = (moodFrequency[label] || 0) + 1;
      
    //update top mood if mood passes the highest count
    if (moodFrequency[label] > highestCount) {
    highestCount = moodFrequency[label];
    topMood = label;}
     }
     });
   });

    setTopEmotion(topMood);

    //Mood consistency score
    const totalMoodEntries = Object.values(moodFrequency).reduce((sum, count) => sum + count, 0);
    const avgMoodCount = totalMoodEntries / Object.keys(moodFrequency).length || 0;
    
    let variationFromAverage = 0;
    Object.values(moodFrequency).forEach(count => {
    variationFromAverage += Math.abs(count - avgMoodCount);
    });

    const moodConsistencyScore = totalMoodEntries ? Math.max(0, 100 - Math.floor((variationFromAverage / totalMoodEntries) * 100)) : 0;
    setMoodConsistency(moodConsistencyScore);
  
    }, [allCheckins, weekOffset]);

    if (loading || !moodData) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
   }

   //prepare data for chart 
   const datasets = moods.map(m => ({
    data: moodData[m.label].map(v => (v === null ? 0 : v)),
    color: () => m.color,
    strokeWidth: 2,
  }));

  //format the week data range for display
  const { start, end } = getWeekRange(weekOffset);
  const formattedRange = formatDateRange(start, end);

return (
  <View style={styles.container}>
  <View style={styles.topRow}>
    <Text style={styles.headerText}>My Mood Story</Text>
  </View>

  <ScrollView style={styles.scrollList}>

  <View style={styles.insightRow}>
  <Text style={styles.sectionHeader}>Insights</Text>
   <TouchableOpacity onPress={() => 
     Alert.alert("📈 Mood Graph","Colors show emotions.\nHigher line = better mood.\nNo line = You skipped check-in.")}>
     <Ionicons name="information-circle-outline" size={22} color="#000000" />
   </TouchableOpacity>
  </View>

  {/*Week Navigation */}
  <View style={styles.navigation}>
  <TouchableOpacity onPress={() => setWeekOffset(weekOffset - 1)} style={{paddingHorizontal: 10}}>
    <Ionicons name="chevron-back" size={24} color="#000000" />
  </TouchableOpacity>

  <View style={styles.spacer} />
    <Text style={styles.subHeading}>{formattedRange}</Text>
  <View style={styles.spacer} />

  <TouchableOpacity onPress={() => setWeekOffset(weekOffset + 1)} style={{ paddingHorizontal: 10 }}>
    <Ionicons name="chevron-forward" size={24} color="#000000" />
  </TouchableOpacity>
  
  </View>

  {/* Legend */}
  <View style={styles.legendRow}>
  {moods.map(mood => (
  <View key={mood.label} style={styles.legendItem}>
  <View style={[styles.legendDot, { backgroundColor: mood.color }]} />
    <Text style={styles.legendText}>{mood.label}</Text>
  </View>
      ))}
  </View>

  <LineChart
  data={{ labels: weekdays, datasets }}
  width={screenWidth}
  height={300}
  chartConfig={{
    backgroundGradientFrom: '#F3EADF',
    backgroundGradientTo: '#fff',
    fillShadowGradient: '#F8F5F1',  
    fillShadowGradientOpacity: 0,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: () => '#000',
    }}
  bezier
  withShadow={false}
  style={styles.chart}
  />

  {/* Weekly Overview */}
  <Text style={styles.sectionHeader}> Weekly Overview</Text>

  <View style={styles.overviewRow}>
        
  <View style={styles.card}>
    <Ionicons name="happy-outline" size={24} color="#A58E74" />
    <Text style={styles.cardLabel}>Top Mood</Text>
    <Text style={styles.cardValue}>{topEmotion || '—'}</Text>
  </View>

  <View style={styles.card}>
    <Ionicons name="checkbox-outline" size={24} color="#A58E74" />
    <Text style={styles.cardLabel}>Check-ins</Text>
    <Text style={styles.cardValue}>{loggedDaysCount}</Text>
  </View>

  <View style={styles.card}>
    <Ionicons name="analytics-outline" size={26} color="#A58E74" />
    <Text style={styles.cardLabel}>Consistency</Text>
    <Text style={styles.cardValue}>{moodConsistency}%</Text>
  </View>
  
  </View>
  </ScrollView>
  </View>
  );
};

export default InsightScreen;

const styles = StyleSheet.create({
container: {
  flex: 1,
  paddingTop: 60,
  paddingHorizontal: 20,
  paddingVertical: 20,
  backgroundColor: '#fff', 
},

scrollList: {
  marginTop: 20,
  flexGrow: 1,
},

topRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  marginBottom: 5,
},

headerText: {
  fontSize: 26,
  fontWeight: 'bold',
  color: '#50483D',
},

subHeading: {
  fontSize: 14,
  textAlign: 'center',
  color: '#000',
},

spacer: {
  flex: 1,
},

chart: {
  borderRadius: 16,
  marginTop: 20,
},

legendRow: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-around',
  marginBottom: 16,
  marginTop: 15,
},

legendItem: {
  flexDirection: 'row',
  alignItems: 'center',
},

legendDot: {
  width: 10,
  height: 10,
  borderRadius: 5,
  marginRight: 6,
},

legendText: {
  fontSize: 13,
  color: 'black',
  textTransform: 'capitalize',
  marginBottom: 6,
  marginRight: 12,
},

overviewItem: {
  fontSize: 14,
  color: '#333',
  marginVertical: 3,
  textAlign: 'center',
},

overviewRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: 8,
},

card: {
  flex: 1,
  backgroundColor: '#F8F5F1',
  paddingVertical: 16,
  borderRadius: 16,
  alignItems: 'center',
  justifyContent: 'center',
  borderColor: '#50483D', 
  borderWidth: 0.5,
},

cardLabel: {
  fontSize: 14,
  color: '#444',
  marginBottom: 4,
  marginTop: 6,
},

cardValue: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#2D2D2D',
},

sectionHeader: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 20,
  marginTop: 20,
  color: '#50483D',
},

navigation:{ 
  flexDirection: 'row', 
  justifyContent: 'center', 
  alignItems: 'center', 
  marginBottom: 10 
},

insightRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 10,
},

});
import { StyleSheet, Text, View, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
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
  const [dateRange, setDateRange] = useState('');
  const [topEmotion, setTopEmotion] = useState(null);
  const [loggedDaysCount, setLoggedDaysCount] = useState(0);
  const [moodConsistency, setMoodConsistency] = useState(0);

  {/*Days */}
    useEffect(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay() + 1); 
    const end = new Date(start);
    end.setDate(start.getDate() + 6); 

    const format = (d) =>
        `${d.toLocaleString('default', { weekday: 'short' })} ${d.getDate()} ${
        d.toLocaleString('default', { month: 'short' })
        }`;

    setDateRange(`${format(start)} - ${format(end)}`);
    }, []);

  {/*MoodData */}
  useEffect(() => {
    const fetchMoodData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) return;

        const moodRef = collection(db, 'users', user.uid, 'moodCheckins');
        const q = query(moodRef, orderBy('createdAt'));
        const snapshot = await getDocs(q);

     
        const moodTrends = {};
        moods.forEach(m => {
          moodTrends[m.label] = Array(7).fill(null);
        });

        snapshot.forEach(doc => {
          const data = doc.data();
          const date = data.createdAt?.toDate();
          const day = date?.getDay(); 

          if (day === undefined) return;

          const adjustedDay = day === 0 ? 6 : day - 1; 
          

          const moodLabel = data.mood;

          if (moodLabel && moodTrends[moodLabel]) {
            const score = 7 - moods.findIndex(m => m.label === moodLabel);
            moodTrends[moodLabel][adjustedDay] = score;
          }
        });

        // Get logged days
        const dayLogged = new Set();
        Object.values(moodTrends).forEach(arr => {
          arr.forEach((v, i) => {
            if (v !== null) dayLogged.add(i);
          });
        });
        setLoggedDaysCount(dayLogged.size);

        // Determine top mood
        const flatMoods = Object.entries(moodTrends).flatMap(([label, values]) =>
          values.map(v => (v !== null ? label : null)).filter(Boolean)
        );

        const moodCounts = {};
        flatMoods.forEach(m => {
          moodCounts[m] = (moodCounts[m] || 0) + 1;
        });

        const top = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
        setTopEmotion(top);

        // Mood consistency score
        const total = Object.values(moodCounts).reduce((a, b) => a + b, 0);
        const avg = total / Object.keys(moodCounts).length || 0;
        let variation = 0;
        Object.values(moodCounts).forEach(count => {
          variation += Math.abs(count - avg);
        });
        const consistency = total ? Math.max(0, 100 - Math.floor((variation / total) * 100)) : 0;
        setMoodConsistency(consistency);

        setMoodData(moodTrends);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching mood data:', error);
        setLoading(false);
      }
    };

    fetchMoodData();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  const datasets = moods.map(m => ({
    data: moodData[m.label].map(v => (v === null ? 0 : v)),
    color: () => m.color,
    strokeWidth: 2,
  }));

return (
    <View style={styles.container}>
    <View style={styles.topRow}>
    <Text style={styles.headerText}>My Mood Story</Text>
    </View>

    <ScrollView style={styles.scrollList}>
    <Text style={styles.sectionHeader}>Insights</Text>
    <Text style={styles.subHeading}>{dateRange}</Text>

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
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FAF9F6', 
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
    marginBottom: 25,
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
  borderWidth: 1,

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

});
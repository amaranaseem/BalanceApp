import { StyleSheet, Text, View, TouchableOpacity, ScrollView, KeyboardAvoidingView } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const moods = [
  { emoji: '😁', label: 'joy', color: '#FFE38E' },
  { emoji: '😞', label: 'sad', color: '#90C3E6' },
  { emoji: '😡',  label: 'angry', color: '#E94F4F' },
  { emoji: '😨',  label: 'fear', color: '#C9B8FF' },
  { emoji: '😌',  label: 'calm', color: '#B8E2DC' },
  { emoji: '😐', label: 'neutral', color: '#B7A282' },
  { emoji: '😯', label: 'surprise', color: '#F7C59F' },
  { emoji: '🤢', label: 'disgust', color: '#BFD8A5' },
  { emoji: '😤', label: 'contempt', color: '#D8A7B1' },

];

const MoodcheckInScreen = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const navigation = useNavigation();

  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });


  const handleSave = () => {
    // Save logic here
    navigation.navigate('HomeTabs'); 
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior='padding'>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Header Row */}
        <View style={styles.topRow}>
          <Text style={styles.headerText}>Mood Check-In</Text>
          <View style={styles.closeCircle}>
            <TouchableOpacity onPress={()=> navigation.navigate('HomeTabs')}>
              <Ionicons name="close" size={22} color="black" />
            </TouchableOpacity>
          </View>
          
        </View>

        {/* Date */}
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={20} color="#A58E74" />
          <Text style={styles.dateText}>{today}</Text>
        </View>

        {/* Mood Selection */}
        <Text style={styles.heading}>How are you feeling?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodScroll}>
          {moods.map((mood, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.moodItem,
                selectedMood?.label === mood.label && {
                  backgroundColor: mood.color
                }
              ]}
              onPress={() => setSelectedMood(mood)}
            >
              <Text style={styles.emoji}>{mood.emoji}</Text>
              <Text style={styles.moodLabel}>{mood.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>

           </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default MoodcheckInScreen;

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

  closeCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D8CAB8',
    opacity: 0.8,
  },

  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#50483D',
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#DDD2C1',
    borderWidth: 1,
    padding: 10,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 20,
    width: '100%',
    justifyContent: 'center',
  },

  dateText: {
    marginLeft: 8,
    color: 'black',
    fontWeight: '600',
  },

  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#50483D',
    marginTop: 16,
    marginBottom: 10,
  },

  moodScroll: {
    maxHeight: 100,
    marginBottom: 10,
  },

  moodItem: {
    backgroundColor: '#F0ECE6',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginRight: 10,
    alignItems: 'center',
    width: 85,
    height: 90,
  },

  emoji: {
    fontSize: 24,
  },

  moodLabel: {
    fontSize: 12,
    marginTop: 9,
    fontWeight: 'bold',
    color: 'black',
    textTransform: 'capitalize',
  },

  saveBtn: {
    marginTop: 20,
    backgroundColor: '#A3D7A2',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  saveText: {
    fontWeight: 'bold',
    color: 'black',
  },

});

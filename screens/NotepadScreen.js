import { StyleSheet, Text, View, TouchableOpacity, ScrollView, KeyboardAvoidingView, TextInput, Alert} from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const moods = [
  {label: 'joy', color: '#FFE38E' },
  {label: 'sad', color: '#90C3E6' },
  {label: 'angry', color: '#E94F4F' },
  {label: 'fear', color: '#C9B8FF' },
  {label: 'calm', color: '#B8E2DC' },
  {label: 'neutral', color: '#B7A282' },
  {label: 'surprise', color: '#F7C59F' },
  {label: 'disgust', color: '#BFD8A5' },
  {label: 'contempt', color: '#D8A7B1' },
];

const NotepadScreen = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [title, setTitle] = useState('');
  const [saveError, setSaveError] = useState('');
  const navigation = useNavigation();

  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleSave = () => {
    setSaveError('');
    if (!selectedMood) {
      setSaveError('Please select a mood before saving.');
      setTimeout(() => setSaveError(''), 3000);
      return;
    }

    Alert.alert("🎉 Well done!", "You've successfully written a journal.", [
      {
        text: "OK",
        onPress: () => navigation.navigate('HomeTabs'),
      },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView contentContainerStyle={styles.container}>

        {/* Top Row */}
        <View style={styles.topRow}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Untitled"
            placeholderTextColor="#999"
            style={styles.headerTextInput}
          />
          <TouchableOpacity
            style={styles.closeCircle}
            onPress={() => navigation.navigate('BottomNavTab', { screen: 'Journal'})}>
            <Ionicons name="close" size={22} color="black" />
          </TouchableOpacity>
        </View>

        {/* Date */}
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={20} color="#A58E74" />
          <Text style={styles.dateText}>{today}</Text>
        </View>

        {/* Mood selection */}
        <Text style={styles.heading}>How are you feeling?</Text>
            <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.moodScroll}
            contentContainerStyle={{ alignItems: 'center' }}
            >
            {moods.map((mood, index) => (
                <TouchableOpacity
                key={index}
                style={[
                    styles.moodItem,
                    selectedMood?.label === mood.label && { backgroundColor: mood.color },
                ]}
                onPress={() => setSelectedMood(mood)}
                >
                <Text style={styles.moodLabelOnly}>{mood.label}</Text>
                </TouchableOpacity>
            ))}
            </ScrollView>

        {/* Error on save */}
        {saveError !== '' && <Text style={styles.errorText}>{saveError}</Text>}

        {/* Write area */}
        <Text style={styles.heading}>Want to jot down what’s on your mind?</Text>
        <TextInput
          style={styles.input}
          placeholder="Write about your day..."
          multiline
          value={note}
          onChangeText={setNote}
        />

        {/* Footer buttons */}
        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="mic-outline" size={24} color="black" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="image-outline" size={24} color="black" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default NotepadScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    marginTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: '#FAF9F6',
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },

  headerTextInput: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    color: '#50483D',
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

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#DDD2C1',
    borderWidth: 1,
    padding: 10,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 20,
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
    marginTop: 10,
    marginBottom: 10,
  },

  moodScroll: {
    maxHeight: 60,
    marginBottom: 10,
  },

  moodItem: {
  backgroundColor: '#F0ECE6',
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderRadius: 14,
  marginRight: 10,
  justifyContent: 'center',
  alignItems: 'center',
  height: 45,
},

moodLabelOnly: {
  fontSize: 14,
  fontWeight: 'bold',
  color: '#50483D',
  textTransform: 'capitalize',
},

  input: {
    height: 320,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderColor: '#D8CAB8',
    borderWidth: 1,
    padding: 14,
    textAlignVertical: 'top',
    marginTop: 8,
    opacity: 0.9,
  },

  errorText: {
    color: '#E94F4F',
    marginTop: 6,
    marginBottom: 4,
    fontSize: 13,
    fontWeight: '500',
    fontStyle: 'italic',
  },

  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 30,
  },

  iconBtn: {
    backgroundColor: '#E6E1D7',
    padding: 12,
    borderRadius: 50,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },

  saveBtn: {
    backgroundColor: '#A58E74',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 18,
  },

  saveText: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 16,
  },
});

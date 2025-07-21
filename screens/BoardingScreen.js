import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Platform, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { auth } from '../firebase';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker'; 
import { Ionicons } from '@expo/vector-icons';


const CLOUDINARY_UPLOAD_PRESET = "profile_image";
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dstxsoomq/image/upload";

const genders = ['Male', 'Female']

const OnboardingScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
     const dateStr = selectedDate.toISOString().split('T')[0];
     setDob(dateStr);
    }
  };

  const pickImage = async () => {
   const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
     alert('Permission to access media library is required!');
     return;
   }

  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });

  if (!result.cancelled) {
    setImage(result.assets[0].uri || result.uri);
  }
  };

 const handleSubmit = async () => {
  const user = auth.currentUser;
  if (!user) return;

  try {
   setUploading(true);
   let imageUrl = "";

   if (image) {
    const formData = new FormData();
    formData.append("file", {
    uri: image,
    type: "image/jpeg",
    name: "profile.jpg",
  });
  formData.append("upload_preset", "profile_image"); 
  formData.append("folder", "profile_image"); 

  const response = await fetch("https://api.cloudinary.com/v1_1/dstxsoomq/image/upload", {
  method: "POST",
  body: formData,
  });

  const data = await response.json();

  if (data.secure_url) {
  imageUrl = data.secure_url;
  } else {
  throw new Error("Image upload failed");
 }
  }

 // Save profile data to Firestore
  const userDocRef = doc(db, "users", user.uid);
   await setDoc(userDocRef, {
    uid: user.uid,
    name,
    username,
    dob,
    gender,
    profileImage: imageUrl || null,
    createdAt: new Date(),
    email: user.email
  });

  Toast.show({
    type: 'success',
    text1: `Welcome ${username} to Balance!`,
  });

  navigation.replace("HomeTabs");

  } catch (error) {
    console.error("Onboarding error:", error);
    alert("Something went wrong. Try again.");
  } finally {
    setUploading(false);
  }
};

return (
  <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
  <Text style={styles.headerText}>Account Setup</Text>

  {/* Profile Picture with edit overlay */}
  <View style={styles.imageWrapper}>
  <Image source={image ? { uri: image } : require('../assets/profilepic.png')} style={styles.image} />
  <TouchableOpacity style={styles.editIcon} onPress={pickImage}>
  <Ionicons name="pencil" size={20} color="#000" />
  </TouchableOpacity>
  </View>

  {/* Name Field */}
  <View style={styles.inputWrapper}>
  <View style={styles.inputContainer}>
    <Ionicons name="person-outline" size={20} color="#A58E74" style={styles.icon} />
  <TextInput
   style={styles.inputText}
   placeholder="Full Name"
   value={name}
   onChangeText={setName}
   autoCapitalize="none"
  />
  </View>
  </View>

  {/* username Field */}
  <View style={styles.inputWrapper}>
  <View style={styles.inputContainer}>
    <Ionicons name="person-outline" size={20} color="#A58E74" style={styles.icon} />
  <TextInput
   style={styles.inputText}
   placeholder="Username"
   value={username}
   onChangeText={setUsername}
   autoCapitalize="none"
  />
  </View>
  </View>

  {/* DOB Selection */}
  <View style={styles.inputWrapper}>
  <TouchableOpacity style={styles.inputContainer} onPress={() => setShowDatePicker(true)}>
  <Ionicons name="calendar-outline" size={20} color="#A58E74" style={styles.icon} />
  <Text style={[styles.inputText, !dob && { color: '#000' }]}> {dob || 'Select Date of Birth'} </Text>
  </TouchableOpacity>
  {showDatePicker && (
  <DateTimePicker 
    value={new Date()}
    mode="date"
    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
    onChange={handleDateChange}
    maximumDate={new Date()}
  />
  )}
  </View>

  {/* Gender Selection */}
  <Text style={styles.label}>Gender</Text>
  <View style={styles.genderContainer}>
  {genders.map((g) => (
  <TouchableOpacity key={g} style={[styles.genderOption, gender === g && styles.selectedGender]} onPress={() => setGender(g)}>
  <Text style={[styles.genderText, gender === g && styles.selectedGenderText]}>{g}</Text>
  </TouchableOpacity>
  ))}
  </View>

  {/* Submit Button */}
  <View style={styles.buttoncontainer}>
  <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={uploading}>
   <Text style={styles.buttonText}>Continue</Text>
  </TouchableOpacity>
  </View>
 
</ScrollView>
  
);
};

export default OnboardingScreen;

const styles = StyleSheet.create({
 container: {
  flexGrow: 1,
  paddingTop: 40,
  paddingHorizontal: 20,
  paddingBottom: 10,
  backgroundColor: '#fff',
  alignItems: 'center'
},

headerText:{
  fontSize: 26,
  fontWeight: '900',
  color: '#50483D',
  alignSelf: 'flex-start',
  marginBottom: 30,
  marginTop: 30,
}, 

imageWrapper: {
  position: 'relative',
  marginBottom: 30,
},
  
image: {
  width: 150,
  height: 150,
  borderRadius: 150,
  backgroundColor: '#ccc',
  alignItems: 'center'
},

editIcon: {
  position: 'absolute',
  right: 0,
  bottom: 0,
  backgroundColor: '#FAEDDD',
  padding: 6,
  borderRadius: 100,
},

icon: {
  marginRight: 10,
},

inputWrapper: {
  width: '100%',
  marginBottom: 10,
  marginTop: 10
},

inputContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  width: '100%',
  height: 50,
  backgroundColor: '#FAEDDD',
  borderRadius: 14,
  paddingHorizontal: 15,
},

inputText: {
  fontSize: 14,
  color: 'black',
  width: '100%'
},

button:{
  padding: 12,
  backgroundColor: '#A8D5BA',
  width: '100%',
  alignItems: 'center',
  position:'absolute', 
  borderRadius: 14,
  marginTop: 40,
  marginBottom: 30,
  elevation: 2,
},

buttonText: {
  fontSize: 16,
  color: '#000',
  fontWeight: 'bold',
},

buttoncontainer:{
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 30,
},

genderContainer: {
  flexDirection: 'row',
  alignSelf: 'flex-start',
  marginBottom: 30,
},

genderOption: {
  marginRight: 10,
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: '#ccc',
},

selectedGender: {
  backgroundColor: '#A58E74',
},

selectedGenderText: {
  color: 'white',
  fontStyle: 'italic',
  fontWeight: 'bold',
},

genderText: {
  color: '#000',
},

label: {
  marginBottom: 10,
  fontWeight: 'bold',
  color: '#50483D',
  marginTop: 20,
  fontSize: 14,
  alignSelf: 'flex-start',
},

});

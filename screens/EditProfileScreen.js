import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const EditProfileScreen = ({ userData, setUserData, closeModal }) => {
  const [image, setImage] = useState(null);
  const [newUsername, setNewUsername] = useState(userData?.username || '');
  const [uploading, setUploading] = useState(false);
  const user = getAuth().currentUser;

{/*Saving the changes on Firebase */}
const pickImage = async () => {
const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
 if (!permission.granted) {
  alert('Permission required to access media library');
  return;
}

const result = await ImagePicker.launchImageLibraryAsync({mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7,});
  if (!result.canceled) {
    setImage(result.assets?.[0]?.uri || result.uri);
  }
};

// uploading the profile image to Cloudinary
const handleSubmit = async () => {
  if (!user) return;
  try {
    setUploading(true);
    let imageUrl = userData?.profileImage || '';

   if (image) {
    const formData = new FormData();
     formData.append('file', {
     uri: image,
     type: 'image/jpeg',
     name: 'profile.jpg',
    });
    
    formData.append('upload_preset', 'profile_image');
    formData.append('folder', 'profile_image');

  const response = await fetch('https://api.cloudinary.com/v1_1/dstxsoomq/image/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
    if (data.secure_url) {
    imageUrl = data.secure_url;
  } else {
      throw new Error('Image upload failed');
   }
  }
  //updating the user info
  const userRef = doc(db, 'users', user.uid);
  await updateDoc(userRef, {
  profileImage: imageUrl,
  username: newUsername,
  });

  setUserData(prev => ({
  ...prev,
  profileImage: imageUrl,
  username: newUsername,
  }));

  Alert.alert('🎉Success', 'Profile updated');
   closeModal();
  } catch (err) {
    console.error('Error updating profile:', err);
    Alert.alert('Error', 'Something went wrong');
  } finally {
    setUploading(false);
    }
  };

return (
 <View style={styles.container}>

 {/* Header */}
 <View style={styles.header}>
 <Text style={styles.title}>Edit Profile</Text>
 <TouchableOpacity onPress={closeModal}>
 <Ionicons name="close" size={24} color="black" />
 </TouchableOpacity>
 </View>

 {/* Profile Image */}
 <View style={styles.imageWrapper}>
 <Image
 source={
    image
    ? { uri: image }
    : userData?.profileImage
    ? { uri: userData.profileImage }
    : require('../assets/profilepic.png')
 }
 style={styles.image}
 />
 <TouchableOpacity onPress={pickImage} style={styles.editIconWrapper}>
    <Ionicons name="pencil" size={16} color="#000"/>
 </TouchableOpacity>
 </View>

 {/* Username Input */}
 <TextInput
    value={newUsername}
    onChangeText={setNewUsername}
    placeholder="Username"
    style={styles.input}
 />

  {/* Save Button */}
  <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit} disabled={uploading}>
  <Text style={styles.saveText}>{uploading ? 'Saving...' : 'Save'}</Text>
  </TouchableOpacity>
  </View>

  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
container: {
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 20,
  width: '100%',
},

header: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
  marginBottom: 20,
  justifyContent: 'space-between'
},

title: {
  fontSize: 20,
  fontWeight: 'bold',
},

imageWrapper: {
  alignItems: 'center',
  marginBottom: 20,
  justifyContent:'center'
},

image: {
  width: 120,
  height: 120,
  borderRadius: 150,
},

editIconWrapper: {
  position: 'absolute',
  right: 90, 
  bottom: 5,
  backgroundColor: '#FAEDDD',
  borderRadius: 20,
  padding: 6,
},

input: {
  borderWidth: 1,
  borderColor: '#ccc',
  fontSize: 16,
  padding: 10,
  marginBottom: 24,
  borderRadius: 10
},

saveBtn: {
  backgroundColor: '#A8D5BA',
  padding: 12,
  borderRadius: 10,
  alignItems: 'center',
  width: '60%',
  alignSelf: 'center'
},

saveText: {
  color: '#000',
  fontSize: 16,
},
});
